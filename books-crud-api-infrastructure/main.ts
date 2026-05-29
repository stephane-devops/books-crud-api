#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { BooksCrudApiInfrastructureStack } from './lib/books-crud-api-infrastructure-stack';
import { BooksCrudApiPipelineStack } from './lib/books-crud-api-pipeline-stack';

const app = new cdk.App();

// Environment for stacks
const env = { account: process.env.CDK_DEFAULT_ACCOUNT, region: 'us-east-1' };

// Main infrastructure stack
new BooksCrudApiInfrastructureStack(app, 'BooksCrudApiInfrastructureStack', {
  env: env,
});

// CI/CD Pipeline stack
new BooksCrudApiPipelineStack(app, 'BooksCrudApiPipelineStack', {
  env: env,
});