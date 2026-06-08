#!/bin/bash

# Script pour squash tous les commits d'une branche et forcer la mise à jour sur le remote.
# ATTENTION : Cela réécrit l'historique. Soyez sûr de ce que vous faites.

set -e

# 1. Récupérer le nom de la branche actuelle
BRANCH=$(git rev-parse --abbrev-ref HEAD)

echo "Squash de tous les commits sur la branche : $BRANCH"

# 2. Créer une branche temporaire orpheline (sans historique)
echo "Création d'une branche temporaire..."
git checkout --orphan temp_branch

# 3. Ajouter tous les fichiers
echo "Ajout des fichiers..."
git add -A

# 4. Créer le commit unique
echo "Création du commit unique..."
git commit -m "Initial commit (squashed history)"

# 5. Supprimer la branche locale d'origine
echo "Suppression de la branche locale d'origine ($BRANCH)..."
git branch -D "$BRANCH"

# 6. Renommer la branche temporaire avec le nom d'origine
echo "Renommage de la branche temporaire en $BRANCH..."
git branch -m "$BRANCH"

# 7. Force push vers le remote
echo "Force push vers origin/$BRANCH..."
echo "Note: Vous devrez peut-être confirmer manuellement si votre remote demande une authentification."
git push -f origin "$BRANCH"

echo "Succès ! Tous les commits ont été squashés et poussés sur le remote."
