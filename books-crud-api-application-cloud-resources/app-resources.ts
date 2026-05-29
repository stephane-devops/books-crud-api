import { Construct } from "constructs";
import { DynamodbTable } from "@cdktf/provider-aws/lib/dynamodb-table";
import { LambdaFunction } from "@cdktf/provider-aws/lib/lambda-function";
import { Apigatewayv2Api } from "@cdktf/provider-aws/lib/apigatewayv2-api";
import { Apigatewayv2Integration } from "@cdktf/provider-aws/lib/apigatewayv2-integration";
import { Apigatewayv2Route } from "@cdktf/provider-aws/lib/apigatewayv2-route";
import { Apigatewayv2Stage } from "@cdktf/provider-aws/lib/apigatewayv2-stage";
import { Apigatewayv2DomainName } from "@cdktf/provider-aws/lib/apigatewayv2-domain-name";
import { Apigatewayv2ApiMapping } from "@cdktf/provider-aws/lib/apigatewayv2-api-mapping";
import { Route53Record } from "@cdktf/provider-aws/lib/route53-record";
import { LambdaPermission } from "@cdktf/provider-aws/lib/lambda-permission";
import { CloudwatchLogGroup } from "@cdktf/provider-aws/lib/cloudwatch-log-group";
import { IamResources } from "./iam";
import {DataAwsCloudformationExport} from "@cdktf/provider-aws/lib/data-aws-cloudformation-export";

export interface AppResourcesConfig {
  region: string;
  HostedZoneIdImport: DataAwsCloudformationExport;
  certificateArnImport: DataAwsCloudformationExport;
  domainNameImport: DataAwsCloudformationExport;
  ecrUriImport: DataAwsCloudformationExport;
}

export class AppResources extends Construct {
  public readonly table: DynamodbTable;
  public readonly api: Apigatewayv2Api;

  constructor(scope: Construct, id: string, config: AppResourcesConfig) {
    super(scope, id);

    // CloudWatch Log Group
    new CloudwatchLogGroup(this, "LambdaLogGroup", {
      name: `/aws/lambda/books-crud-api`,
      retentionInDays: 1,
    });

    // DynamoDB Table
    this.table = new DynamodbTable(this, "BooksTable", {
      name: "Books",
      billingMode: "PAY_PER_REQUEST",
      attribute: [
        { name: "id", type: "S" }
      ],
      hashKey: "id",
    });

    // IAM Resources
    const iam = new IamResources(this, "IamResources", {
      tableName: this.table.name,
      tableArn: this.table.arn,
    });

    // Lambda Function
    const lambda = new LambdaFunction(this, "BooksApiLambda", {
      functionName: "books-crud-api",
      packageType: "Image",
      imageUri: `${config.ecrUriImport.value}:latest`,
      role: iam.lambdaRole.arn,
      timeout: 30,
      memorySize: 512,
      environment: {
        variables: {
          DB_TABLE: this.table.name,
          BREF_BINARY_RESPONSES: "1"
        },
      },
    });

    // API Gateway v2 (HTTP API)
    this.api = new Apigatewayv2Api(this, "BooksApiGateway", {
      name: "Books API",
      protocolType: "HTTP",
    });

    const integration = new Apigatewayv2Integration(this, "LambdaIntegration", {
      apiId: this.api.id,
      integrationType: "AWS_PROXY",
      integrationUri: lambda.arn,
      payloadFormatVersion: "2.0",
    });

    new Apigatewayv2Route(this, "DefaultRoute", {
      apiId: this.api.id,
      routeKey: "$default",
      target: `integrations/${integration.id}`,
    });

    const apiStage = new Apigatewayv2Stage(this, "DefaultStage", {
      apiId: this.api.id,
      name: "$default",
      autoDeploy: true,
    });

    // Custom Domain Name
    const apiDomainName = new Apigatewayv2DomainName(this, "ApiDomainName", {
      domainName: `api.${config.domainNameImport.value}`,
      domainNameConfiguration: {
        certificateArn: config.certificateArnImport.value,
        endpointType: "REGIONAL",
        securityPolicy: "TLS_1_2",
      },
    });

    new Apigatewayv2ApiMapping(this, "ApiMapping", {
      apiId: this.api.id,
      domainName: apiDomainName.domainName,
      stage: apiStage.id,
    });

    // Route53 Record for API
    new Route53Record(this, "ApiRoute53Record", {
      zoneId: config.HostedZoneIdImport.value,
      name: "api",
      type: "A",
      alias: {
        name: apiDomainName.domainNameConfiguration.targetDomainName,
        zoneId: apiDomainName.domainNameConfiguration.hostedZoneId,
        evaluateTargetHealth: false,
      },
    });

    new LambdaPermission(this, "ApiGatewayLambdaPermission", {
      functionName: lambda.functionName,
      action: "lambda:InvokeFunction",
      principal: "apigateway.amazonaws.com",
      sourceArn: `${this.api.executionArn}/*/*`,
    });
  }
}
