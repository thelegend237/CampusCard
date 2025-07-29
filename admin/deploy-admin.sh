#!/bin/bash

# 🚀 Script de déploiement Admin CampusCard (Linux/Mac)
# Usage: ./deploy-admin.sh [message_commit]

set -e

echo "🚀 Démarrage du déploiement Admin CampusCard..."

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Message de commit par défaut
COMMIT_MESSAGE=${1:-"🚀 Deploy admin to Vercel"}

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

echo -e "${BLUE}🔧 Installation des dépendances admin...${NC}"
npm install

echo -e "${BLUE}🔍 Vérification du code admin...${NC}"
npm run lint

echo -e "${BLUE}🏗️ Build de l'application admin...${NC}"
npm run build:check

echo -e "${GREEN}✅ Build admin réussi !${NC}"

echo -e "${BLUE}📦 Préparation du commit...${NC}"

# Vérifier s'il y a des changements
if git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}⚠️ Aucun changement détecté dans l'admin${NC}"
else
    echo -e "${BLUE}📝 Ajout des fichiers admin...${NC}"
    git add admin/
    
    echo -e "${BLUE}💾 Commit des changements admin...${NC}"
    git commit -m "$COMMIT_MESSAGE"
    
    echo -e "${BLUE}🚀 Push vers GitHub...${NC}"
    git push origin main
    
    echo -e "${GREEN}✅ Code admin poussé vers GitHub${NC}"
fi

echo -e "${BLUE}🌐 Déploiement admin sur Vercel...${NC}"
echo -e "${YELLOW}⚠️ IMPORTANT : Configurez un nouveau projet Vercel avec :${NC}"
echo -e "${YELLOW}   - Root Directory : admin${NC}"
echo -e "${YELLOW}   - Framework Preset : Vite${NC}"
echo -e "${YELLOW}   - Build Command : npm run build${NC}"
echo -e "${YELLOW}   - Output Directory : dist${NC}"

echo -e "${GREEN}🎉 Déploiement admin terminé !${NC}"
echo -e "${BLUE}📋 Prochaines étapes :${NC}"
echo -e "   1. Créer un nouveau projet Vercel pour l'admin"
echo -e "   2. Configurer le dossier racine sur 'admin'"
echo -e "   3. Configurer les variables d'environnement"
echo -e "   4. Tester l'accès admin"

echo -e "${BLUE}📖 Consultez admin/DEPLOYMENT.md pour plus de détails${NC}" 