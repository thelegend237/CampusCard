@echo off
REM 🚀 Script de déploiement Admin CampusCard (Windows)
REM Usage: deploy-admin.bat [message_commit]

setlocal enabledelayedexpansion

echo 🚀 Démarrage du déploiement Admin CampusCard...

REM Message de commit par défaut
set "COMMIT_MESSAGE=%1"
if "%COMMIT_MESSAGE%"=="" set "COMMIT_MESSAGE=🚀 Deploy admin to Vercel"

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

echo 🔧 Installation des dépendances admin...
call npm install
if errorlevel 1 (
    echo ❌ Erreur lors de l'installation des dépendances
    exit /b 1
)

echo 🔍 Vérification du code admin...
call npm run lint
if errorlevel 1 (
    echo ❌ Erreur lors du linting
    exit /b 1
)

echo 🏗️ Build de l'application admin...
call npm run build:check
if errorlevel 1 (
    echo ❌ Erreur lors du build
    exit /b 1
)

echo ✅ Build admin réussi !

echo 📦 Préparation du commit...

REM Vérifier s'il y a des changements
git diff-index --quiet HEAD --
if errorlevel 1 (
    echo 📝 Ajout des fichiers admin...
    git add admin/
    
    echo 💾 Commit des changements admin...
    git commit -m "%COMMIT_MESSAGE%"
    
    echo 🚀 Push vers GitHub...
    git push origin main
    
    echo ✅ Code admin poussé vers GitHub
) else (
    echo ⚠️ Aucun changement détecté dans l'admin
)

echo 🌐 Déploiement admin sur Vercel...
echo ⚠️ IMPORTANT : Configurez un nouveau projet Vercel avec :
echo    - Root Directory : admin
echo    - Framework Preset : Vite
echo    - Build Command : npm run build
echo    - Output Directory : dist

echo 🎉 Déploiement admin terminé !
echo 📋 Prochaines étapes :
echo    1. Créer un nouveau projet Vercel pour l'admin
echo    2. Configurer le dossier racine sur 'admin'
echo    3. Configurer les variables d'environnement
echo    4. Tester l'accès admin

echo 📖 Consultez admin/DEPLOYMENT.md pour plus de détails

pause 