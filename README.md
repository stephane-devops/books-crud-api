# Books CRUD API Project

Ce projet est une API CRUD pour la gestion de livres, construite avec une architecture moderne basée sur AWS, l'Infrastructure as Code (IaC) et PHP (Laravel).

## Structure du Projet

Le projet est divisé en trois répertoires principaux :

1. **[books-crud-api-infrastructure](./books-crud-api-infrastructure)** : 
   - Infrastructure de base (**AWS CDK**).
   - Gère le dépôt ECR, le backend Terraform (S3/DynamoDB) et le **pipeline CI/CD**.

2. **[books-crud-api-application-cloud-resources](./books-crud-api-application-cloud-resources)** :
   - Ressources spécifiques à l'application (**CDKTF**).
   - Gère l'API Gateway, la fonction Lambda et la table DynamoDB applicative.

3. **[books-crud-api-application-php](./books-crud-api-application-php)** :
   - Application backend (Laravel 11).
   - Contient le code source PHP et la configuration Docker.

4. **[books-crud-api-application-frontend](./books-crud-api-application-frontend)** :
   - Interface utilisateur React comprenant **Swagger** et une **Book App**.
   - Construit avec React et Swagger UI pour gérer les livres et tester l'API visuellement.

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
- **CI/CD** : **AWS CDK Pipelines**.
- **Frontend** : **React** + **Swagger UI** + **Book App**.

## Interface Frontend (Swagger & Book App)

Le projet inclut une interface utilisateur React moderne avec deux onglets principaux :
1. **Book App** : Une application de gestion de livres permettant de lister, ajouter, modifier et supprimer des livres.
2. **Swagger API Docs** : Une interface interactive basée sur Swagger UI pour explorer et tester les points de terminaison de l'API.

L'interface est déployée de manière statique sur Amazon S3 et servie via CloudFront.

- **Localisation** : `books-crud-api-application-frontend`
- **Fonctionnalités** :
  - Gestion CRUD complète des livres via une interface conviviale.
  - Visualisation de la spécification OpenAPI (`swagger.json`).
  - Test interactif des endpoints CRUD de l'API.
  - Mise à jour dynamique de l'URL de l'API lors du déploiement via le pipeline.

## Pipeline CI/CD

Le projet inclut un pipeline de déploiement continu automatisé via **AWS CDK Pipelines**, défini dans `BooksCrudApiPipelineStack`.

### Déploiement du Pipeline

Pour déployer le pipeline initialement, exécutez la commande suivante depuis le répertoire `books-crud-api-infrastructure` :

```bash
cd books-crud-api-infrastructure
npx cdk deploy BooksCrudApiPipelineStack --context github_repo=OWNER/REPO --context domainName=example.com --context certificateArn=arn:aws:acm:...
```

*Note : Remplacez `OWNER/REPO` par votre dépôt GitHub (ex: `myuser/books-crud-api`) et fournissez les informations de domaine/certificat valides.*

### Fonctionnement du Pipeline

Le pipeline est divisé en plusieurs étapes clés :

1. **Source** : Surveille la branche `main` de votre dépôt GitHub.
2. **Synth** : 
   - Compile le code TypeScript.
   - Génère les templates CloudFormation pour l'infrastructure CDK.
   - Prépare les ressources pour CDKTF.
3. **Self-Mutation** : Le pipeline se met à jour automatiquement en cas de modification de sa propre définition.
4. **Deploy CDK Infrastructure** : Déploie les ressources de base (ECR, S3 pour le state Terraform, etc.).
5. **Deploy Application Resources (CDKTF)** : 
   - Installe Terraform dans l'environnement de build.
   - Déploie l'API Gateway, la Lambda et DynamoDB via `cdktf deploy`.
   - Exporte l'URL de l'API vers un fichier de résultats.
6. **Deploy Frontend** :
   - Récupère l'URL de l'API générée par l'étape précédente.
   - Injecte dynamiquement cette URL dans `swagger.json`.
   - Build l'application React.
   - Synchronise les fichiers vers le bucket S3 statique.
