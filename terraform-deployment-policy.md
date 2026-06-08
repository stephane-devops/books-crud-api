# CodeBuild Terraform Deployment Policy

This document outlines the recommended IAM policy for a CodeBuild role that deploys infrastructure using Terraform (or CDKTF), specifically for the `books-crud-api` project.

## Policy Overview

The following policy follows the principle of least privilege by scoping permissions to the services used in this project.

### TypeScript / CDK Version

```typescript
rolePolicyStatements: [
  new iam.PolicyStatement({
    actions: [
      "s3:*",
      "dynamodb:*",
      "lambda:*",
      "apigateway:*",
      "cloudfront:*",
      "acm:*",
      "logs:*",
      "route53:*",
      "iam:*",
      "cloudformation:DescribeStacks",
      "cloudformation:ListExports"
    ],
    resources: ["*"], // Ideally scoped to specific ARNs where possible
  }),
],
```

### JSON Version (IAM Policy)

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:ListBucket",
                "dynamodb:DescribeTable",
                "dynamodb:GetItem",
                "dynamodb:PutItem",
                "dynamodb:DeleteItem",
                "dynamodb:CreateTable",
                "dynamodb:UpdateTable",
                "dynamodb:DeleteTable",
                "lambda:CreateFunction",
                "lambda:UpdateFunctionCode",
                "lambda:UpdateFunctionConfiguration",
                "lambda:DeleteFunction",
                "lambda:GetFunction",
                "lambda:AddPermission",
                "lambda:RemovePermission",
                "apigateway:GET",
                "apigateway:POST",
                "apigateway:PUT",
                "apigateway:DELETE",
                "apigateway:PATCH",
                "cloudfront:CreateDistribution",
                "cloudfront:GetDistribution",
                "cloudfront:UpdateDistribution",
                "cloudfront:DeleteDistribution",
                "cloudfront:TagResource",
                "cloudfront:UntagResource",
                "cloudfront:ListDistributions",
                "cloudfront:CreateOriginAccessControl",
                "cloudfront:GetOriginAccessControl",
                "cloudfront:UpdateOriginAccessControl",
                "cloudfront:DeleteOriginAccessControl",
                "acm:DescribeCertificate",
                "acm:ListCertificates",
                "logs:CreateLogGroup",
                "logs:DeleteLogGroup",
                "logs:DescribeLogGroups",
                "logs:PutRetentionPolicy",
                "route53:ChangeResourceRecordSets",
                "route53:GetHostedZone",
                "route53:ListResourceRecordSets",
                "iam:CreateRole",
                "iam:DeleteRole",
                "iam:GetRole",
                "iam:PutRolePolicy",
                "iam:DeleteRolePolicy",
                "iam:AttachRolePolicy",
                "iam:DetachRolePolicy",
                "iam:PassRole",
                "cloudformation:DescribeStacks",
                "cloudformation:ListExports"
            ],
            "Resource": "*"
        }
    ]
}
```

## Permission Categories

1.  **Terraform State:** S3 and DynamoDB (for locking) to manage the state file.
2.  **Resource Management:** Specific permissions for Lambda, DynamoDB (application tables), API Gateway, and CloudWatch Logs.
3.  **DNS:** Route53 permissions for managing API domain records.
4.  **IAM:** Permissions to create and assign roles to the Lambda function (`iam:PassRole` is critical).
5.  **Metadata:** CloudFormation permissions to read exports from other stacks.
