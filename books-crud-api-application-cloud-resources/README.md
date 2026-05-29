# Books CRUD API - Application Cloud Resources

Ce projet utilise **CDKTF** (Cloud Development Kit for Terraform) pour définir les ressources cloud spécifiques à l'application.

## Ressources Gérées

- **API Gateway (HTTP API)** : Point d'entrée pour les requêtes CRUD.
- **Lambda Function** : Exécute l'application PHP (Laravel) via une image Docker stockée sur ECR.
- **DynamoDB Table** : Stocke les données des livres (Books).

## Dépendances

Ce projet dépend de la stack `books-crud-api-infrastructure` pour :
- Le backend S3/DynamoDB (importé via CloudFormation Exports).
- Le dépôt ECR pour l'image Lambda.

## Prérequis

- [Terraform](https://www.terraform.io/downloads.html) installé.
- [CDKTF CLI](https://developer.hashicorp.com/terraform/cdktf/getting-started/install) installé.
- [Node.js](https://nodejs.org/) (v18+) et npm.

## Installation

```bash
npm install
npx cdktf get
```

## Déploiement

1. Assurez-vous que la stack d'infrastructure est déployée.
2. Synthétisez et déployez :
   ```bash
   npx cdktf deploy
   ```

## Configuration du Backend

Le backend est configuré dynamiquement pour utiliser le bucket S3 et la table DynamoDB créés par la stack CDK principale. Ces valeurs sont récupérées via des exports CloudFormation.

## Commandes Utiles

- `npx cdktf synth` : Génère le code Terraform (JSON).
- `npx cdktf diff` : Affiche les changements prévus.
- `npx cdktf destroy` : Supprime les ressources créées.
