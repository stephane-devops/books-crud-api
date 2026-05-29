import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

export class TerraformBackend extends Construct {
  public readonly bucket: s3.Bucket;
  public readonly table: dynamodb.Table;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    const stack = cdk.Stack.of(this);

    // Terraform Backend: S3 Bucket
    this.bucket = new s3.Bucket(this, 'TerraformStateBucket', {
      bucketName: `books-crud-api-terraform-state-${stack.account}`,
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      encryption: s3.BucketEncryption.S3_MANAGED,
    });

    // Terraform Backend: DynamoDB Table for Locking
    this.table = new dynamodb.Table(this, 'TerraformStateLockTable', {
      tableName: 'books-crud-api-terraform-lock',
      partitionKey: { name: 'LockID', type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    // Exports for CDKTF
    new cdk.CfnOutput(this, 'TerraformStateBucketName', {
      value: this.bucket.bucketName,
      exportName: 'books-crud-api-terraform-state-bucket',
    });

    new cdk.CfnOutput(this, 'TerraformStateLockTableName', {
      value: this.table.tableName,
      exportName: 'books-crud-api-terraform-lock-table',
    });
  }
}
