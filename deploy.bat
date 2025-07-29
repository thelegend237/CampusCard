@echo off
REM 🚀 Script de déploiement CampusCard sur Vercel (Windows)
REM Usage: deploy.bat [message_commit]

setlocal enabledelayedexpansion

echo 🚀 Démarrage du déploiement CampusCard...

REM Message de commit par défaut
set "COMMIT_MESSAGE=%1"
if "%COMMIT_MESSAGE%"=="" set "COMMIT_MESSAGE=🚀 Deploy to Vercel"

echo 📋 Vérification de l'environnement...

REM Vérifier que Node.js est installé
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js n'est pas installé
    exit /b 1
)

REM Vérifier que npm est installé
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm n'est pas installé
    exit /b 1
)

REM Vérifier que git est installé
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ git n'est pas installé
    exit /b 1
)

echo ✅ Environnement vérifié

echo 🔧 Installation des dépendances...
call npm install
if errorlevel 1 (
    echo ❌ Erreur lors de l'installation des dépendances
    exit /b 1
)

echo 🔍 Vérification du code...
call npm run lint
if errorlevel 1 (
    echo ❌ Erreur lors du linting
    exit /b 1
)

echo 🏗️ Build de l'application...
call npm run build:check
if errorlevel 1 (
    echo ❌ Erreur lors du build
    exit /b 1
)

echo ✅ Build réussi !

echo 📦 Préparation du commit...

REM Vérifier s'il y a des changements
git diff-index --quiet HEAD --
if errorlevel 1 (
    echo 📝 Ajout des fichiers...
    git add .
    
    echo 💾 Commit des changements...
    git commit -m "%COMMIT_MESSAGE%"
    
    echo 🚀 Push vers GitHub...
    git push origin main
    
    echo ✅ Code poussé vers GitHub
) else (
    echo ⚠️ Aucun changement détecté
)

echo 🌐 Déploiement sur Vercel...
echo ⚠️ Assurez-vous que votre projet est connecté à Vercel
echo ⚠️ Le déploiement se fera automatiquement via GitHub

echo 🎉 Déploiement terminé !
echo 📋 Prochaines étapes :
echo    1. Vérifier le déploiement sur Vercel
echo    2. Configurer les variables d'environnement
echo    3. Créer un compte admin
echo    4. Tester l'application

echo 📖 Consultez DEPLOYMENT.md pour plus de détails

pause 