import { Construct } from "constructs";
import { S3Backend } from "cdktf";

import { BookCrudApiConfig } from "./main";



export class AppBackend extends Construct {

  constructor(scope: Construct, id: string, config: BookCrudApiConfig) {
    super(scope, id);

    new S3Backend(scope, {
      bucket: config.bucketImport,
      key: "books-crud-api-application/terraform.tfstate",
      region: config.region,
      dynamodbTable: config.lockTableImport,
      encrypt: true,
    });
  }
}
