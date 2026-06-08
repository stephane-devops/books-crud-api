import { Construct } from "constructs";
import { IamRole } from "@cdktf/provider-aws/lib/iam-role";
import { IamPolicy } from "@cdktf/provider-aws/lib/iam-policy";
import { IamRolePolicyAttachment } from "@cdktf/provider-aws/lib/iam-role-policy-attachment";

export interface IamResourcesConfig {
  tableName: string;
  tableArn: string;
}

export class IamResources extends Construct {
  public readonly lambdaRole: IamRole;

  constructor(scope: Construct, id: string, config: IamResourcesConfig) {
    super(scope, id);

    // IAM Role for Lambda
    this.lambdaRole = new IamRole(this, "LambdaRole", {
      name: "books-crud-api-lambda-role",
      assumeRolePolicy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [
          {
            Action: "sts:AssumeRole",
            Principal: {
              Service: "lambda.amazonaws.com",
            },
            Effect: "Allow",
            Sid: "",
          },
        ],
      }),
    });

    // Attach Basic Execution Policy (Logs)
    new IamRolePolicyAttachment(this, "LambdaLogs", {
      role: this.lambdaRole.name,
      policyArn: "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
    });

    // Specific DynamoDB Policy (Least Privilege)
    const dynamoPolicy = new IamPolicy(this, "LambdaDynamoPolicy", {
      name: "books-crud-api-dynamo-policy",
      policy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Action: [
              "dynamodb:PutItem",
              "dynamodb:GetItem",
              "dynamodb:UpdateItem",
              "dynamodb:DeleteItem",
              "dynamodb:Scan",
              "dynamodb:Query",
            ],
            Resource: [config.tableArn],
          },
        ],
      }),
    });

    new IamRolePolicyAttachment(this, "LambdaDynamoDB", {
      role: this.lambdaRole.name,
      policyArn: dynamoPolicy.arn,
    });
  }
}
