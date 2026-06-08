import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as assets from 'aws-cdk-lib/aws-ecr-assets';
import * as path from 'path';

export interface AppImagePreparerProps {
  readonly repositoryName: string;
}

export class AppImagePreparer extends Construct {
  public readonly repository: ecr.Repository;
  public readonly asset: assets.DockerImageAsset;

  constructor(scope: Construct, id: string, props: AppImagePreparerProps) {
    super(scope, id);

    this.repository = new ecr.Repository(this, 'BooksCrudApiRepository', {
      repositoryName: props.repositoryName,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      emptyOnDelete: true,
    });

    // On définit l'asset Docker basé sur le répertoire de l'application PHP.
    // Le chemin est relatif à la racine du projet ou au répertoire d'exécution.
    // On s'attend à ce que l'infrastructure soit lancée depuis son propre répertoire.
    this.asset = new assets.DockerImageAsset(this, 'AppImage', {
      directory: path.join(__dirname, '../../books-crud-api-application-php'),
    });
  }
}
