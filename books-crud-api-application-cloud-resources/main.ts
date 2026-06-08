import { Construct } from "constructs";
import {App, TerraformStack, TerraformOutput, S3Backend} from "cdktf";
import { AwsProvider } from "@cdktf/provider-aws/lib/provider";
import { AppBackend } from "./constructs/backend";
import { AppResources } from "./constructs/app-resources";
import { FrontendResources } from "./constructs/frontend-resources";
import {DataAwsCloudformationExport} from "@cdktf/provider-aws/lib/data-aws-cloudformation-export";
import { CloudFormationExportService } from "./constructs/cloudformation-export.service";


export interface BookCrudApiConfig {
  bucketImport: string
  lockTableImport: string
  region: string
}

class BookCrudApi extends TerraformStack {
  constructor(scope: Construct, id: string, config:BookCrudApiConfig) {
    super(scope, id);

    new AwsProvider(this, "AWS", {
      region: config.region,
    });

    const ecrUriImport = new DataAwsCloudformationExport(this, "EcrUriImport", {
      name: "books-crud-api-ecr-repository-uri",
    });

    const domainNameImport = new DataAwsCloudformationExport(this, "DomainNameImport", {
      name: "api-domain-name",
    });

    const backendSubdomainImport = new DataAwsCloudformationExport(this, "BackendSubdomainImport", {
      name: "api-backend-subdomain",
    });

    const frontendSubdomainImport = new DataAwsCloudformationExport(this, "FrontendSubdomainImport", {
      name: "api-frontend-subdomain",
    });

    const certificateArnImport = new DataAwsCloudformationExport(this, "CertificateArnImport", {
      name: "api-certificate-arn",
    });

    const HostedZoneIdImport = new DataAwsCloudformationExport(this, "HostedZoneIdImport", {
      name: "api-hosted-zone-id",
    });

    new TerraformOutput(this, "ecrUriExport", {
      value: ecrUriImport.value,
    });

    new TerraformOutput(this, "domainNameExport", {
      value: domainNameImport.value,
    });

    new TerraformOutput(this, "backendSubdomainExport", {
      value: backendSubdomainImport.value,
    });

    new TerraformOutput(this, "frontendSubdomainExport", {
      value: frontendSubdomainImport.value,
    });

    new TerraformOutput(this, "certificateArnExport", {
      value: certificateArnImport.value,
    });

    new AppBackend(this, "AppBackend", {
      region: config.region,
      bucketImport: config.bucketImport,
      lockTableImport: config.lockTableImport,
    });

    const resources = new AppResources(this, "AppResources", {
      HostedZoneIdImport,
      certificateArnImport,
      domainNameImport,
      backendSubdomainImport,
      ecrUriImport,
      region: config.region,
    });

    const frontend = new FrontendResources(this, "FrontendResources", {
      HostedZoneIdImport,
      certificateArnImport,
      domainNameImport,
      frontendSubdomainImport,
      region: config.region,
    });

    new TerraformOutput(this, "frontend_bucket_name", {
      value: frontend.bucketName,
    });

    new TerraformOutput(this, "frontend_distribution_id", {
      value: frontend.distributionId,
    });

    new TerraformOutput(this, "api_url", {
      value: `https://${resources.customDomainName}`,
    });
  }
}

(async ()=>{

  const app = new App();
  const region = "us-east-1";
  const service = new CloudFormationExportService(region);

  const bucketImport = await service.getRequiredExportValue(
      "books-crud-api-terraform-state-bucket",
  );

  const lockTableImport = await service.getRequiredExportValue(
      "books-crud-api-terraform-lock-table"
  );

  new BookCrudApi(app, "books-crud-api-application-cloud-resources", {
    lockTableImport,
    bucketImport,
    region
  });

  app.synth();

})();


