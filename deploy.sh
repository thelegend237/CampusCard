#!/bin/bash

# 🚀 Script de déploiement CampusCard sur Vercel
# Usage: ./deploy.sh [message_commit]

set -e

echo "🚀 Démarrage du déploiement CampusCard..."

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Message de commit par défaut
COMMIT_MESSAGE=${1:-"🚀 Deploy to Vercel"}

echo -e "${BLUE}📋 Vérification de l'environnement...${NC}"

# Vérifier que Node.js est installé
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js n'est pas installé${NC}"
    exit 1
fi

# Vérifier que npm est installé
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm n'est pas installé${NC}"
    exit 1
fi

# Vérifier que git est installé
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ git n'est pas installé${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Environnement vérifié${NC}"

echo -e "${BLUE}🔧 Installation des dépendances...${NC}"
npm install

echo -e "${BLUE}🔍 Vérification du code...${NC}"
npm run lint

echo -e "${BLUE}🏗️  Build de l'application...${NC}"
npm run build:check

echo -e "${GREEN}✅ Build réussi !${NC}"

echo -e "${BLUE}📦 Préparation du commit...${NC}"

# Vérifier s'il y a des changements
if git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}⚠️  Aucun changement détecté${NC}"
else
    echo -e "${BLUE}📝 Ajout des fichiers...${NC}"
    git add .
    
    echo -e "${BLUE}💾 Commit des changements...${NC}"
    git commit -m "$COMMIT_MESSAGE"
    
    echo -e "${BLUE}🚀 Push vers GitHub...${NC}"
    git push origin main
    
    echo -e "${GREEN}✅ Code poussé vers GitHub${NC}"
fi

echo -e "${BLUE}🌐 Déploiement sur Vercel...${NC}"
echo -e "${YELLOW}⚠️  Assurez-vous que votre projet est connecté à Vercel${NC}"
echo -e "${YELLOW}⚠️  Le déploiement se fera automatiquement via GitHub${NC}"

echo -e "${GREEN}🎉 Déploiement terminé !${NC}"
echo -e "${BLUE}📋 Prochaines étapes :${NC}"
echo -e "   1. Vérifier le déploiement sur Vercel"
echo -e "   2. Configurer les variables d'environnement"
echo -e "   3. Créer un compte admin"
echo -e "   4. Tester l'application"

echo -e "${BLUE}📖 Consultez DEPLOYMENT.md pour plus de détails${NC}" 