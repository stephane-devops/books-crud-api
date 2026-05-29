import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as route53 from 'aws-cdk-lib/aws-route53';

export class BooksCrudApiInfrastructureStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ECR Repository for PHP application image
    const repository = new ecr.Repository(this, 'BooksCrudApiRepository', {
      repositoryName: 'books-crud-api',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      emptyOnDelete: true,
    });

    // Terraform Backend: S3 Bucket
    const bucket = new s3.Bucket(this, 'TerraformStateBucket', {
      bucketName: `books-crud-api-terraform-state-${this.account}`,
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      encryption: s3.BucketEncryption.S3_MANAGED,
      autoDeleteObjects: true,
    });

    // Terraform Backend: DynamoDB Table for Locking
    const table = new dynamodb.Table(this, 'TerraformStateLockTable', {
      tableName: 'books-crud-api-terraform-lock',
      partitionKey: { name: 'LockID', type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });
    
    // Get domain name from context
    const domainName = this.node.tryGetContext('domainName');
    
    // Look up Hosted Zone ID from domain name
    const hostedZone = route53.HostedZone.fromLookup(this, 'HostedZone', {
      domainName: domainName,
    });


    // Exports for CDKTF
    new cdk.CfnOutput(this, 'TerraformStateBucketName', {
      value: bucket.bucketName,
      exportName: 'books-crud-api-terraform-state-bucket',
    });

    new cdk.CfnOutput(this, 'TerraformStateLockTableName', {
      value: table.tableName,
      exportName: 'books-crud-api-terraform-lock-table',
    });

    new cdk.CfnOutput(this, 'EcrRepositoryUri', {
      value: repository.repositoryUri,
      exportName: 'books-crud-api-ecr-repository-uri',
    });

    new cdk.CfnOutput(this, 'CertificateArn', {
      value: this.node.tryGetContext('certificateArn'),
      exportName: 'api-certificate-arn',
    });

    new cdk.CfnOutput(this, 'DomainName', {
      value: domainName,
      exportName: 'api-domain-name',
    });

    new cdk.CfnOutput(this, 'HostedZoneId', {
      value: hostedZone.hostedZoneId,
      exportName: 'api-hosted-zone-id',
    });
  }
}
