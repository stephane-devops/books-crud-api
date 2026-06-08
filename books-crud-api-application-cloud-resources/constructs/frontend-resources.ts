import { Construct } from "constructs";
import { S3Bucket } from "@cdktf/provider-aws/lib/s3-bucket";
import { S3BucketPublicAccessBlock } from "@cdktf/provider-aws/lib/s3-bucket-public-access-block";
import { CloudfrontDistribution } from "@cdktf/provider-aws/lib/cloudfront-distribution";
import { CloudfrontOriginAccessControl } from "@cdktf/provider-aws/lib/cloudfront-origin-access-control";
import { S3BucketPolicy } from "@cdktf/provider-aws/lib/s3-bucket-policy";
import { S3Object } from "@cdktf/provider-aws/lib/s3-object";
import { Route53Record } from "@cdktf/provider-aws/lib/route53-record";
import { DataAwsCloudformationExport } from "@cdktf/provider-aws/lib/data-aws-cloudformation-export";
import { DataAwsIamPolicyDocument } from "@cdktf/provider-aws/lib/data-aws-iam-policy-document";

export interface FrontendResourcesConfig {
  region: string;
  HostedZoneIdImport: DataAwsCloudformationExport;
  certificateArnImport: DataAwsCloudformationExport;
  domainNameImport: DataAwsCloudformationExport;
  frontendSubdomainImport: DataAwsCloudformationExport;
}

export class FrontendResources extends Construct {
  constructor(scope: Construct, id: string, config: FrontendResourcesConfig) {
    super(scope, id);

    const frontendDomainName = `${config.frontendSubdomainImport.value}.${config.domainNameImport.value}`;

    // S3 Bucket for Frontend
    const bucket = new S3Bucket(this, "FrontendBucket", {
      bucket: frontendDomainName,
      forceDestroy: true,
    });

    new S3BucketPublicAccessBlock(this, "FrontendBucketPublicAccessBlock", {
      bucket: bucket.id,
      blockPublicAcls: true,
      blockPublicPolicy: true,
      ignorePublicAcls: true,
      restrictPublicBuckets: true,
    });

    // CloudFront Origin Access Control
    const oac = new CloudfrontOriginAccessControl(this, "FrontendOAC", {
      name: `${frontendDomainName}-oac`,
      originAccessControlOriginType: "s3",
      signingBehavior: "always",
      signingProtocol: "sigv4",
    });

    // CloudFront Distribution
    const distribution = new CloudfrontDistribution(this, "FrontendDistribution", {
      enabled: true,
      defaultRootObject: "index.html",
      aliases: [frontendDomainName],
      viewerCertificate: {
        acmCertificateArn: config.certificateArnImport.value,
        sslSupportMethod: "sni-only",
        minimumProtocolVersion: "TLSv1.2_2021",
      },
      origin: [
        {
          domainName: bucket.bucketRegionalDomainName,
          originId: "S3Origin",
          originAccessControlId: oac.id,
        },
      ],
      defaultCacheBehavior: {
        allowedMethods: ["GET", "HEAD", "OPTIONS"],
        cachedMethods: ["GET", "HEAD"],
        targetOriginId: "S3Origin",
        forwardedValues: {
          queryString: false,
          cookies: {
            forward: "none",
          },
        },
        viewerProtocolPolicy: "redirect-to-https",
        minTtl: 0,
        defaultTtl: 0,
        maxTtl: 86400,
      },
      restrictions: {
        geoRestriction: {
          restrictionType: "none",
        },
      },
      customErrorResponse: [
        {
          errorCode: 404,
          responseCode: 200,
          responsePagePath: "/index.html",
        },
        {
          errorCode: 403,
          responseCode: 200,
          responsePagePath: "/index.html",
        },
      ],
    });

    // S3 Bucket Policy for CloudFront Access
    const policyDocument = new DataAwsIamPolicyDocument(this, "FrontendBucketPolicyDocument", {
      statement: [
        {
          actions: ["s3:GetObject"],
          resources: [`${bucket.arn}/*`],
          principals: [
            {
              type: "Service",
              identifiers: ["cloudfront.amazonaws.com"],
            },
          ],
          condition: [
            {
              test: "StringEquals",
              variable: "AWS:SourceArn",
              values: [distribution.arn],
            },
          ],
        },
      ],
    });

    new S3BucketPolicy(this, "FrontendBucketPolicy", {
      bucket: bucket.id,
      policy: policyDocument.json,
    });

    // Initial index.html to avoid 403 Access Denied during first deployment
    new S3Object(this, "InitialIndex", {
      bucket: bucket.id,
      key: "index.html",
      content: "<html><body><h1>Deploying...</h1></body></html>",
      contentType: "text/html",
      lifecycle: {
        ignoreChanges: ["content", "source", "etag"],
      },
    });

    // Route53 Record
    new Route53Record(this, "FrontendRoute53Record", {
      zoneId: config.HostedZoneIdImport.value,
      name: config.frontendSubdomainImport.value,
      type: "A",
      alias: {
        name: distribution.domainName,
        zoneId: distribution.hostedZoneId,
        evaluateTargetHealth: false,
      },
    });

    this.bucketName = bucket.bucket;
    this.distributionId = distribution.id;
  }

  public readonly bucketName: string;
  public readonly distributionId: string;
}
