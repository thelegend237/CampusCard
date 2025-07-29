# 🚀 Déploiement Admin CampusCard

## 📋 Vue d'ensemble

L'interface d'administration de CampusCard peut être déployée **séparément** de l'application principale pour une meilleure sécurité et maintenance.

## 🎯 Options de déploiement

### Option 1 : Déploiement séparé sur Vercel (Recommandé)

#### Avantages
- ✅ Séparation complète des environnements
- ✅ Sécurité renforcée
- ✅ Maintenance indépendante
- ✅ URLs distinctes
- ✅ Déploiements indépendants

#### Étapes

1. **Créer un nouveau projet Vercel**
   - Allez sur [vercel.com](https://vercel.com)
   - "New Project"
   - Importez le même repository GitHub
   - **Important** : Configurez le dossier racine sur `admin`

2. **Configuration Vercel**
   - **Root Directory** : `admin`
   - **Framework Preset** : Vite
   - **Build Command** : `npm run build`
   - **Output Directory** : `dist`
   - **Install Command** : `npm install`

3. **Variables d'environnement**
   ```
   VITE_SUPABASE_URL=https://votre-projet.supabase.co
   VITE_SUPABASE_ANON_KEY=votre_cle_anon_supabase
   ```

4. **URLs après déploiement**
   - **Admin** : `https://admin-votre-domaine.vercel.app/`
   - **Connexion** : `https://admin-votre-domaine.vercel.app/admin/login`

### Option 2 : Sous-domaine dédié

#### Configuration DNS
```
admin.votre-domaine.com → Projet Vercel Admin
www.votre-domaine.com  → Projet Vercel Principal
```

## 🔧 Configuration locale

### Test du build admin
```bash
cd admin
npm install
npm run build:check
npm run build
npm run preview
```

### Développement local
```bash
cd admin
npm run dev
# L'admin sera accessible sur http://localhost:5176
```

## 🔒 Sécurité

### Variables d'environnement
- ✅ Jamais commitées dans Git
- ✅ Configurées dans Vercel
- ✅ Mêmes clés Supabase que l'app principale

### Authentification
- ✅ Système d'authentification séparé
- ✅ Vérification du rôle `admin`
- ✅ Redirection automatique si non autorisé

## 📊 Structure des routes admin

| Route | Description |
|-------|-------------|
| `/` | Redirection vers `/admin/dashboard` |
| `/admin/login` | Page de connexion |
| `/admin/dashboard` | Tableau de bord principal |
| `/admin/students` | Gestion des étudiants |
| `/admin/cards` | Gestion des cartes |
| `/admin/payments` | Gestion des paiements |
| `/admin/departments` | Gestion des départements |
| `/admin/reports` | Rapports et statistiques |
| `/admin/settings` | Paramètres |
| `/admin/support` | Support |

## 🚀 Script de déploiement rapide

### Windows
```bash
cd admin
deploy-admin.bat
```

### Linux/Mac
```bash
cd admin
./deploy-admin.sh
```

## 🔍 Dépannage

### Erreur de build
```bash
cd admin
npm run build:check
```

### Problème d'authentification
- Vérifiez les variables d'environnement
- Vérifiez que le compte admin existe dans Supabase
- Vérifiez les policies RLS

### Problème de routes
- Vérifiez que `vercel.json` est présent dans le dossier admin
- Vérifiez la configuration des rewrites

## 📞 Support

- **Documentation principale** : `../DEPLOYMENT.md`
- **Configuration** : `vercel.json`, `vite.config.ts`
- **Variables d'environnement** : `env.example`

---

**🎉 L'admin séparé offre une meilleure sécurité et maintenance !** 