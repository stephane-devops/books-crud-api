import { Construct } from "constructs";
import {App, TerraformStack, TerraformOutput, S3Backend} from "cdktf";
import { AwsProvider } from "@cdktf/provider-aws/lib/provider";
import { AppBackend } from "./backend";
import { AppResources } from "./app-resources";
import {DataAwsCloudformationExport} from "@cdktf/provider-aws/lib/data-aws-cloudformation-export";
import { CloudFormationExportService } from "./cloudformation-export.service";


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
      ecrUriImport,
      region: config.region,
    });

    new TerraformOutput(this, "api_url", {
      value: resources.api.apiEndpoint,
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


