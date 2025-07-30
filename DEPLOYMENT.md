# 🚀 Guide de Déploiement CampusCard

## Prérequis

### 1. Comptes requis
- ✅ Compte GitHub/GitLab/Bitbucket
- ✅ Compte Vercel (gratuit)
- ✅ Projet Supabase actif

### 2. Variables d'environnement Supabase
Récupérez ces informations dans votre projet Supabase (Settings > API) :
- `VITE_SUPABASE_URL` : URL de votre projet
- `VITE_SUPABASE_ANON_KEY` : Clé publique anonyme

## 📋 Checklist de préparation

### ✅ Code source
- [ ] Code poussé sur GitHub
- [ ] Tests locaux passés (`npm run build`)
- [ ] Pas de fichiers sensibles dans le repo
- [ ] `.env` dans `.gitignore`

### ✅ Configuration Supabase
- [ ] Projet Supabase actif
- [ ] Tables créées et migrées
- [ ] Policies RLS appliquées
- [ ] Storage configuré (bucket `avatar`)

## 🛠️ Étapes de déploiement

### Étape 1 : Préparation locale
```bash
# Vérifier que tout fonctionne
npm run build:check
npm run build

# Tester le build
npm run preview
```

### Étape 2 : Push sur GitHub
```bash
git add .
git commit -m "🚀 Prepare for Vercel deployment"
git push origin main
```

### Étape 3 : Déploiement Vercel

1. **Connexion Vercel**
   - Allez sur [vercel.com](https://vercel.com)
   - Connectez-vous avec GitHub

2. **Import du projet**
   - Cliquez "New Project"
   - Sélectionnez votre repository
   - Vercel détectera automatiquement Vite

3. **Configuration du projet**
   - **Framework Preset** : Vite
   - **Root Directory** : `./` (racine)
   - **Build Command** : `npm run build`
   - **Output Directory** : `dist`
   - **Install Command** : `npm install`

4. **Variables d'environnement**
   Dans **Environment Variables**, ajoutez :
   ```
   VITE_SUPABASE_URL=https://votre-projet.supabase.co
   VITE_SUPABASE_ANON_KEY=votre_cle_anon_supabase
   ```

5. **Déploiement**
   - Cliquez "Deploy"
   - Attendez la fin du build (2-3 minutes)

## 🔧 Configuration post-déploiement

### Création du compte admin

#### Option A : Via Supabase Dashboard
1. **Créer l'utilisateur Auth**
   - Supabase > Authentication > Users
   - "Add user"
   - Email : `admin@votre-domaine.com`
   - Password : `MotDePasseSecurise123!`
   - ✅ Email confirmed

2. **Créer le profil admin**
   - Supabase > SQL Editor
   - Exécutez le script SQL :

```sql
-- Récupérer l'ID de l'utilisateur créé
SELECT id FROM auth.users WHERE email = 'admin@votre-domaine.com';

-- Créer le profil admin (remplacez UUID_PAR_LE_VRAI_ID)
INSERT INTO users (
  id, 
  email, 
  role, 
  firstname, 
  lastname, 
  created_at
) VALUES (
  'UUID_DE_L_UTILISATEUR_AUTH', -- Remplacez par l'ID réel
  'admin@votre-domaine.com',
  'admin',
  'Admin',
  'Principal',
  NOW()
);
```

#### Option B : Via Edge Function (Recommandé)
1. **Déployer la fonction Supabase**
   ```bash
   cd supabase/functions/create-student
   supabase functions deploy create-student
   ```

2. **Créer l'admin via API**
   ```bash
   curl -X POST https://votre-projet.supabase.co/functions/v1/create-student \
     -H "Authorization: Bearer VOTRE_SERVICE_ROLE_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@votre-domaine.com",
       "password": "MotDePasseSecurise123!",
       "role": "admin",
       "firstname": "Admin",
       "lastname": "Principal"
     }'
   ```

### Test de l'accès admin

1. **URL de connexion** : `https://votre-domaine.vercel.app/admin/login`
2. **Identifiants** :
   - Email : `admin@votre-domaine.com`
   - Mot de passe : `MotDePasseSecurise123!`

## 🌐 URLs importantes

| Page | URL |
|------|-----|
| **Accueil** | `https://votre-domaine.vercel.app/` |
| **Connexion étudiant** | `https://votre-domaine.vercel.app/login` |
| **Dashboard étudiant** | `https://votre-domaine.vercel.app/dashboard` |
| **Connexion admin** | `https://votre-domaine.vercel.app/admin/login` |
| **Dashboard admin** | `https://votre-domaine.vercel.app/admin/dashboard` |

## 🔍 Dépannage

### Erreur de build
```bash
# Vérifier les logs
vercel logs

# Rebuild local
npm run build
```

### Erreur 404 sur les routes
- ✅ Vérifiez que `vercel.json` est présent
- ✅ Vérifiez la configuration des rewrites

### Problème d'authentification
- ✅ Vérifiez les variables d'environnement
- ✅ Vérifiez que Supabase est actif
- ✅ Vérifiez les policies RLS

### Problème d'accès admin
- ✅ Vérifiez que le compte admin existe
- ✅ Vérifiez que le rôle est `admin`
- ✅ Vérifiez les policies Supabase

## 📊 Monitoring

### Vercel Analytics
- Activer dans le dashboard Vercel
- Suivre les performances
- Analyser les erreurs

### Supabase Monitoring
- Dashboard Supabase > Logs
- Surveiller les requêtes
- Vérifier les erreurs RLS

## 🔒 Sécurité

### Variables d'environnement
- ✅ Jamais commitées dans Git
- ✅ Configurées dans Vercel
- ✅ Clés Supabase sécurisées

### Policies RLS
- ✅ Activées sur toutes les tables
- ✅ Testées en production
- ✅ Accès admin vérifié

### Headers de sécurité
- ✅ Configurés dans `vercel.json`
- ✅ Protection XSS
- ✅ Protection clickjacking

## 📈 Optimisations

### Performance
- ✅ Code splitting configuré
- ✅ Assets optimisés
- ✅ Cache configuré

### SEO
- ✅ Meta tags configurés
- ✅ Sitemap (optionnel)
- ✅ Robots.txt (optionnel)

## 🎉 Déploiement réussi !

Votre application CampusCard est maintenant en ligne et accessible à tous vos utilisateurs !

### Prochaines étapes
1. Tester toutes les fonctionnalités
2. Créer des comptes étudiants
3. Configurer les départements
4. Former les administrateurs
5. Lancer en production

---

**Support** : En cas de problème, consultez les logs Vercel et Supabase, ou créez une issue sur GitHub. 