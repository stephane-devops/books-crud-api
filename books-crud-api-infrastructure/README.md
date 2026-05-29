# Books CRUD API - Infrastructure

Ce projet utilise **AWS CDK** pour définir l'infrastructure de base nécessaire au projet.

## Ressources Gérées

- **ECR Repository** : Stocke l'image Docker de l'application PHP (Laravel).
- **Terraform Backend** : 
    - **S3 Bucket** : Stocke le fichier d'état (`terraform.tfstate`) pour CDKTF.
    - **DynamoDB Table** : Gère le verrouillage (locking) de l'état Terraform.

## CloudFormation Exports

Ce projet expose des valeurs via CloudFormation Exports pour être utilisées par la stack CDKTF :
- `books-crud-api-terraform-state-bucket`
- `books-crud-api-terraform-lock-table`
- `books-crud-api-ecr-repository-uri`

## Déploiement

1. Installez les dépendances :
   ```bash
   npm install
   ```

2. Déployez la stack :
   ```bash
   npx cdk deploy
   ```

## Commandes Utiles

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template
