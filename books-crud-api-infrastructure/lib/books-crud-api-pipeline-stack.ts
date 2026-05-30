import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CodePipeline, CodePipelineSource, ShellStep, CodeBuildStep } from 'aws-cdk-lib/pipelines';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as assert from "node:assert";
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as iam from 'aws-cdk-lib/aws-iam';
import { BooksCrudApiInfrastructureStack } from './books-crud-api-infrastructure-stack';

class AppStage extends cdk.Stage {
  public readonly infrastructureLayer: BooksCrudApiInfrastructureStack;

  constructor(scope: Construct, id: string, props?: cdk.StageProps) {
    super(scope, id, props);
    this.infrastructureLayer = new BooksCrudApiInfrastructureStack(this, 'InfrastructureLayer', {
      env: props?.env
    });
  }
}

export class BooksCrudApiPipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const githubRepo = this.node.tryGetContext('github_repo') || assert.fail('github_repo context must be provided');

    const pipeline = new CodePipeline(this, 'Pipeline', {
      pipelineName: 'books-crud-api-pipeline',
      codeBuildDefaults: {
        buildEnvironment: {
          buildImage: codebuild.LinuxBuildImage.AMAZON_LINUX_2_5,
        },
      },
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.gitHub(githubRepo, 'main'),
        installCommands: [
          'n 22'
        ],
        commands: [
          'cd books-crud-api-infrastructure',
          'node -v',
          'npm i',
          'npm run build',
          'npx cdk synth',
          'cd ../books-crud-api-application-cloud-resources',
          'npm i',
          'npm run build'
        ],
        primaryOutputDirectory: 'books-crud-api-infrastructure/cdk.out'
      }),
    });

    const deployStage = new AppStage(this, 'Deploy', {
      env: props?.env
    });
    pipeline.addStage(deployStage);

    const cdktfDeployStep = new CodeBuildStep('CdktfDeploy', {
      installCommands: [
        'sudo yum install -y yum-utils',
        'sudo yum-config-manager --add-repo https://rpm.releases.hashicorp.com/AmazonLinux/hashicorp.repo',
        'sudo yum -y install terraform'
      ],
      commands: [
        'n 22',
        'cd books-crud-api-application-cloud-resources',
        'node -v',
        'terraform -version',
        'npm i',
        'npx cdktf deploy --auto-approve'
      ],
      buildEnvironment: {
        buildImage: codebuild.LinuxBuildImage.AMAZON_LINUX_2_5,
      },
      rolePolicyStatements: [
        new iam.PolicyStatement({
          actions: ['*'],
          resources: ['*'],
        }),
      ],
    });

    const cdktfWave = pipeline.addWave('ApplicationResources', {
      post: [cdktfDeployStep],
    });

    const frontendDeployStep = new CodeBuildStep('FrontendDeploy', {
      input: pipeline.synth,
      installCommands: [
        'n 22'
      ],
      commands: [
        'cd books-crud-api-application-frontend',
        'npm i',
        'npm run build',
        'cd ../books-crud-api-application-cloud-resources',
        'npm i',
        'npx cdktf output --json > outputs.json',
        'FRONTEND_BUCKET=$(cat outputs.json | jq -r \'.["books-crud-api-application-cloud-resources"].frontend_bucket_name\')',
        'cd ../books-crud-api-application-frontend',
        'aws s3 sync build/ s3://$FRONTEND_BUCKET --delete'
      ],
      buildEnvironment: {
        buildImage: codebuild.LinuxBuildImage.AMAZON_LINUX_2_5,
      },
      rolePolicyStatements: [
        new iam.PolicyStatement({
          actions: ['s3:PutObject', 's3:ListBucket', 's3:DeleteObject', 's3:GetObject'],
          resources: ['*'],
        }),
        new iam.PolicyStatement({
          actions: ['cloudformation:DescribeStacks'],
          resources: ['*'],
        })
      ],
    });

    cdktfWave.addPost(frontendDeployStep);

    pipeline.buildPipeline();
  }
}
