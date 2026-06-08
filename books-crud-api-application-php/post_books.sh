#!/bin/bash

# API Endpoint
API_URL="https://api.clouddevops.ca/books"

# Diversified Quebec authors
BOOKS=(
    '{"title": "Bonheur d'\''occasion", "author": "Gabrielle Roy", "year": 1945}'
    '{"title": "Kamouraska", "author": "Anne Hébert", "year": 1970}'
    '{"title": "Maria Chapdelaine", "author": "Louis Hémon", "year": 1913}'
    '{"title": "Le Matou", "author": "Yves Beauchemin", "year": 1981}'
    '{"title": "L'\''Avalée des avalés", "author": "Réjean Ducharme", "year": 1966}'
    '{"title": "Les Belles-Sœurs", "author": "Michel Tremblay", "year": 1968}'
    '{"title": "Comment faire l'\''amour avec un Nègre sans se fatiguer", "author": "Dany Laferrière", "year": 1985}'
    '{"title": "Poésies complètes", "author": "Émile Nelligan", "year": 1904}'
    '{"title": "Agaguk", "author": "Yves Thériault", "year": 1958}'
    '{"title": "Un dimanche à Kyoto", "author": "Gilles Vigneault", "year": 1959}'
)

echo "Posting 10 diversified Quebec books to $API_URL..."

for BOOK in "${BOOKS[@]}"; do
    echo "Posting: $BOOK"
    curl -X POST "$API_URL" \
         -H "Content-Type: application/json" \
         -d "$BOOK"
    echo -e "\n-----------------------------------"
done

echo "Done!"
