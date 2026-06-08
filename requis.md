# Architecture

- **dossier "books-crud-api-infrastructure"**
    - AWS CDK
        - Registre ECR
        - Backend Terraform
            - Godet S3
            - Table DynamoDB

- **dossier "books-crud-api-application-cloud-resources"**
    - CDKTF (Terraform)
        - API Gateway
        - Fonction Lambda
            - Application CRUD PHP (modèle Book), provenant du registre ECR
        - DynamoDB table
        - Application Front-end (Swagger et Book App)
          - s3 bucket
          - Cloudfront
          - Route53

- **dossier "books-crud-api-application-php"**
    - Laravel
    - Dockerfile
    - Amorçage (Bootstrap) du premier push vers le registre ECR