# Books CRUD API Project

Ce projet est une API CRUD pour la gestion de livres, construite avec une architecture moderne basée sur AWS, l'Infrastructure as Code (IaC) et PHP (Laravel).

## Structure du Projet

Le projet est divisé en trois répertoires principaux :

1. **[books-crud-api-infrastructure](./books-crud-api-infrastructure)** : 
   - Infrastructure de base (**AWS CDK**).
   - Gère le dépôt ECR et le backend Terraform (S3/DynamoDB).

2. **[books-crud-api-application-cloud-resources](./books-crud-api-application-cloud-resources)** :
   - Ressources spécifiques à l'application (**CDKTF**).
   - Gère l'API Gateway, la fonction Lambda et la table DynamoDB applicative.

3. **[books-crud-api-application-php](./books-crud-api-application-php)** :
   - Application backend (Laravel 11).
   - Contient le code source PHP et la configuration Docker.

## Flux de Travail (Workflow)

1. **Déployer l'Infrastructure** : Allez dans `books-crud-api-infrastructure` et déploiez via CDK. Cela créera le dépôt ECR nécessaire.
2. **Préparer l'Application** : Allez dans `books-crud-api-application-php`, construisez l'image Docker et poussez-la vers ECR.
3. **Déployer les Ressources Cloud** : Allez dans `books-crud-api-application-cloud-resources` et déploiez via CDKTF.

## Architecture et Partage de Ressources (Export/Import)

Ce projet utilise un mécanisme robuste de partage de ressources entre les différentes couches d'infrastructure. Bien que nous utilisions deux outils différents (**AWS CDK** et **CDKTF**), ils communiquent via les **CloudFormation Exports**.

### Comment ça marche ?

1. **Export (Stack d'Infrastructure)** : Le projet `books-crud-api-infrastructure` (CDK) définit les ressources de base (ECR, S3, DynamoDB) et expose leurs identifiants uniques via des `CfnOutput` avec des noms d'export globaux.
2. **Import (Stack Applicative)** : Le projet `books-crud-api-application-cloud-resources` (CDKTF) utilise une ressource `DataAwsCloudformationExport` pour récupérer dynamiquement ces valeurs au moment du déploiement.

### Pourquoi est-ce efficace ?

- **Découplage Logiciel** : L'infrastructure de base peut évoluer indépendamment de l'application. Tant que les noms d'export restent constants, la stack applicative n'a pas besoin de connaître les détails internes de la stack d'infrastructure.
- **Single Source of Truth (Source Unique de Vérité)** : Les valeurs (comme l'URI ECR ou le nom du bucket) ne sont jamais copiées-collées manuellement. Cela élimine les erreurs humaines et les dérives de configuration.
- **Automatisation du Backend** : CDKTF utilise le bucket S3 et la table DynamoDB créés par CDK pour stocker son propre état Terraform. Cela permet une gestion centralisée du cycle de vie des ressources de management.
- **Cohérence Multi-Environnement** : Le passage d'un environnement à l'autre (dev, staging, prod) est facilité car les liens entre les stacks sont gérés dynamiquement par AWS.

## Architecture

- **Frontend/API** : AWS API Gateway (HTTP).
- **Compute** : AWS Lambda (Image Docker PHP/Laravel).
- **Database** : Amazon DynamoDB.
- **IaC** : **AWS CDK** (Infrastructure) & **CDKTF** (Ressources applicatives).
