import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CodePipeline, CodePipelineSource, ShellStep, CodeBuildStep } from 'aws-cdk-lib/pipelines';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as assert from "node:assert";
import * as ecr from 'aws-cdk-lib/aws-ecr';
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
        commands: [
          'cd books-crud-api-infrastructure',
          'npm ci',
          'npm run build',
          'npx cdk synth',
          'cd ../books-crud-api-application-cloud-resources',
          'npm ci',
          'npm run build'
        ],
        primaryOutputDirectory: 'books-crud-api-infrastructure/cdk.out'
      }),
    });

    const deployStage = new AppStage(this, 'Deploy', {
      env: props?.env
    });
    pipeline.addStage(deployStage);

    const cdktfWave = pipeline.addWave('ApplicationResources', {
      post: [
        new CodeBuildStep('CdktfDeploy', {
          commands: [
            'cd books-crud-api-application-cloud-resources',
            'npm ci',
            'npx cdktf deploy --auto-approve'
          ],
          buildEnvironment: {
            buildImage: codebuild.LinuxBuildImage.AMAZON_LINUX_2_5,
          },
        }),
      ],
    });

    pipeline.buildPipeline();
  }
}
