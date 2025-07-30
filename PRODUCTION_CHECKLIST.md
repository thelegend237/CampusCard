# 🚀 Checklist Production - Admin

## ✅ Bonne nouvelle !
Si ça fonctionne en local, c'est un excellent signe ! Mais vérifions quelques points pour la production.

## 🔍 Différences Local vs Production

### **Local (http://localhost:5173)**
- ✅ Serveur de développement Vite
- ✅ Hot reload activé
- ✅ Variables d'environnement locales
- ✅ Pas de problèmes de CORS

### **Production (Vercel)**
- ⚠️ Build optimisé
- ⚠️ Variables d'environnement Vercel
- ⚠️ CDN et cache
- ⚠️ Possibles problèmes de routing

## 📋 Checklist Production

### 1. **Variables d'environnement Vercel**
Dans votre projet Vercel → Settings → Environment Variables :
```
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anon_supabase
```

### 2. **Configuration Vercel**
Vérifiez `vercel.json` :
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### 3. **Build de production**
Testez le build local :
```bash
npm run build
npm run preview
```
Puis testez : `http://localhost:4173/admin/test`

### 4. **Imports et chemins**
- ✅ Tous les imports utilisent des chemins relatifs
- ✅ Pas d'imports vers `../admin/src/` dans l'app principale
- ✅ Composants admin dans `src/`

## 🧪 Tests de Production

### **Test 1 : Build local**
```bash
npm run build
npm run preview
```
Allez sur : `http://localhost:4173/admin/test`

### **Test 2 : Vercel Preview**
1. Push sur GitHub
2. Vercel crée un preview
3. Testez l'URL preview

### **Test 3 : Production**
1. Merge sur main
2. Vercel déploie en production
3. Testez l'URL finale

## 🚨 Problèmes Potentiels en Production

### **Problème 1 : Variables d'environnement**
```
Error: Supabase URL not found
```
**Solution** : Vérifiez les variables dans Vercel

### **Problème 2 : Routing**
```
Error: 404 on /admin/login
```
**Solution** : Vérifiez `vercel.json`

### **Problème 3 : CORS**
```
Error: CORS policy
```
**Solution** : Vérifiez la configuration Supabase

### **Problème 4 : Build errors**
```
Error: Cannot find module
```
**Solution** : Vérifiez les imports

## 🔧 Vérifications Avant Déploiement

### **1. Test du build**
```bash
npm run build
```
Vérifiez qu'il n'y a pas d'erreurs

### **2. Test preview**
```bash
npm run preview
```
Testez toutes les routes admin

### **3. Variables d'environnement**
Vérifiez que `.env` contient :
```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anon_supabase
```

### **4. Imports vérifiés**
- ✅ `AdminLoginPage` dans `src/pages/`
- ✅ `AdminRoute` dans `src/components/`
- ✅ Pas d'imports vers `../admin/src/`

## 📊 URLs de Test

### **Local**
- Test : `http://localhost:5173/admin/test`
- Login : `http://localhost:5173/admin/login`

### **Preview (Vercel)**
- Test : `https://votre-app-git-main.vercel.app/admin/test`
- Login : `https://votre-app-git-main.vercel.app/admin/login`

### **Production**
- Test : `https://votre-app.vercel.app/admin/test`
- Login : `https://votre-app.vercel.app/admin/login`

## 🎯 Plan de Test

### **Étape 1 : Build local**
```bash
npm run build
npm run preview
```
Testez : `http://localhost:4173/admin/test`

### **Étape 2 : Push et Preview**
```bash
git add .
git commit -m "Fix admin routing for production"
git push origin main
```
Testez l'URL preview Vercel

### **Étape 3 : Production**
Si le preview fonctionne, mergez sur main
Testez l'URL de production

## 🚨 En cas de problème

### **Logs Vercel**
1. Allez dans Vercel Dashboard
2. Deployments → Dernier déploiement
3. Vérifiez les logs de build

### **Console navigateur**
1. Ouvrez l'URL de production
2. F12 → Console
3. Regardez les erreurs

### **Network tab**
1. F12 → Network
2. Rechargez la page
3. Vérifiez les requêtes qui échouent

## 💡 Conseils

1. **Testez toujours en preview** avant production
2. **Vérifiez les variables d'environnement** dans Vercel
3. **Regardez les logs** de build Vercel
4. **Testez sur différents navigateurs**
5. **Vérifiez la console** pour les erreurs

---

**🎯 Conclusion** : Si ça marche en local, ça devrait marcher en production avec les bonnes variables d'environnement ! 