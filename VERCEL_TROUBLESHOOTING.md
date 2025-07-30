# 🔧 Dépannage Déploiement Vercel

## ❌ Erreur : "No Output Directory named 'dist' found"

### Problème
```
Error: No Output Directory named "dist" found after the Build completed.
```

### Solutions

#### Solution 1 : Configuration Vercel Dashboard
1. Allez dans votre projet Vercel
2. Settings → General
3. **Build & Development Settings**
4. Configurez :
   - **Framework Preset** : Vite
   - **Build Command** : `npm run build`
   - **Output Directory** : `dist`
   - **Install Command** : `npm install`

#### Solution 2 : Vérifier le build local
```bash
# Nettoyer et rebuilder
rm -rf dist
npm run build

# Vérifier que le dossier dist existe
ls -la dist/
```

#### Solution 3 : Configuration package.json
Ajoutez dans `package.json` :
```json
{
  "scripts": {
    "build": "vite build",
    "vercel-build": "npm run build"
  }
}
```

#### Solution 4 : Configuration vercel.json simplifiée
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

#### Solution 5 : Variables d'environnement
Assurez-vous que ces variables sont configurées dans Vercel :
```
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anon_supabase
```

### 🔍 Diagnostic

#### Vérifier les logs de build
1. Dans Vercel Dashboard → Deployments
2. Cliquez sur le dernier déploiement
3. Vérifiez les logs de build

#### Problèmes courants
- **Dépendances manquantes** : Vérifiez `package.json`
- **Variables d'environnement** : Configurées dans Vercel
- **Conflit de configuration** : Simplifiez `vercel.json`

### 🚀 Déploiement Admin Séparé

Si le problème persiste avec l'app principale, utilisez le déploiement admin séparé :

1. **Créer un nouveau projet Vercel**
2. **Root Directory** : `admin`
3. **Framework Preset** : Vite
4. **Build Command** : `npm run build`
5. **Output Directory** : `dist`

### 📞 Support

- **Logs Vercel** : Dashboard → Deployments → Logs
- **Documentation** : `DEPLOYMENT.md`
- **Admin séparé** : `admin/DEPLOYMENT.md`

---

**💡 Conseil** : Commencez par simplifier la configuration et ajoutez progressivement les optimisations. 