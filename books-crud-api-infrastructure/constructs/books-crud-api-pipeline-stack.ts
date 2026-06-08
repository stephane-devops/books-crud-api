import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CodePipeline, CodePipelineSource, ShellStep, CodeBuildStep, ManualApprovalStep } from 'aws-cdk-lib/pipelines';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as assert from "node:assert";
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

    const source = CodePipelineSource.gitHub(githubRepo, 'main');

    const pipeline = new CodePipeline(this, 'Pipeline', {
      pipelineName: 'books-crud-api-pipeline',
      codeBuildDefaults: {
        buildEnvironment: {
          buildImage: codebuild.LinuxBuildImage.AMAZON_LINUX_2_5,
        },
      },
      synth: new ShellStep('Synth', {
        input: source,
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

    const deployStage = new AppStage(this, 'DeployCDK', {
      env: props?.env
    });
    pipeline.addStage(deployStage);

    const cdktfDeployStep = new CodeBuildStep('DeployCDKTF', {
      input: source,
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
        'npx cdktf deploy --auto-approve --outputs-file outputs.json'
      ],
      primaryOutputDirectory: 'books-crud-api-application-cloud-resources',
      buildEnvironment: {
        buildImage: codebuild.LinuxBuildImage.AMAZON_LINUX_2_5,
      },
      rolePolicyStatements: [
        new iam.PolicyStatement({
          actions: [
            's3:*',
            'dynamodb:*',
            'lambda:*',
            'apigateway:*',
            'cloudfront:*',
            'acm:*',
            'logs:*',
            'route53:*',
            'iam:*',
            'cloudformation:DescribeStacks',
            'cloudformation:ListExports',
          ],
          resources: ['*'],
        }),
      ],
    });

    const frontendDeployStep = new CodeBuildStep('DeployFrontend', {
      input: source,
      additionalInputs: {
        'cdktf-outputs': cdktfDeployStep.primaryOutput!,
      },
      installCommands: [
        'n 22'
      ],
      commands: [
        'cd books-crud-api-application-frontend',
        'npm i',
        'API_URL=$(cat ../cdktf-outputs/outputs.json | jq -r \'.["books-crud-api-application-cloud-resources"].api_url\')',
        'jq --arg url "$API_URL" \'.servers[0].url = $url\' src/swagger.json > src/swagger.json.tmp && mv src/swagger.json.tmp src/swagger.json',
        'REACT_APP_API_URL=$API_URL npm run build',
        'FRONTEND_BUCKET=$(cat ../cdktf-outputs/outputs.json | jq -r \'.["books-crud-api-application-cloud-resources"].frontend_bucket_name\')',
        'aws s3 sync build/ s3://$FRONTEND_BUCKET --delete',
        'aws cloudfront create-invalidation --distribution-id $(cat ../cdktf-outputs/outputs.json | jq -r \'.["books-crud-api-application-cloud-resources"].frontend_distribution_id\') --paths "/*"'
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
          actions: ['cloudfront:CreateInvalidation'],
          resources: ['*'],
        }),
        new iam.PolicyStatement({
          actions: ['cloudformation:DescribeStacks', 'cloudformation:ListExports'],
          resources: ['*'],
        })
      ],
    });

    pipeline.addWave('DeployApplicationResources', {
      post: [cdktfDeployStep, frontendDeployStep],
    });

    pipeline.buildPipeline();
  }
}
