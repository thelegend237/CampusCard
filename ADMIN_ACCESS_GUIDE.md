# 🔐 Guide d'Accès à l'Espace Admin

## 🎯 Structure Actuelle

Avec votre structure actuelle, l'application principale inclut **les deux interfaces** (étudiant ET admin) dans un seul déploiement.

## 🌐 URLs d'Accès

### **Application Principale** (après déploiement Vercel)
```
https://votre-app.vercel.app/
```

### **Espace Admin**
```
https://votre-app.vercel.app/admin/login
```

### **Espace Étudiant**
```
https://votre-app.vercel.app/login
```

## 🔑 Processus de Connexion Admin

### 1. **Accéder à la page de connexion admin**
- Allez sur : `https://votre-app.vercel.app/admin/login`
- Ou tapez directement dans l'URL : `/admin/login`

### 2. **Se connecter avec un compte admin**
- **Email** : `admin@iut.com` (ou l'email que vous avez configuré)
- **Mot de passe** : Le mot de passe que vous avez défini

### 3. **Accès aux fonctionnalités admin**
Après connexion, vous serez redirigé vers :
- **Dashboard admin** : `/admin/dashboard`
- **Gestion des étudiants** : `/admin/students`
- **Gestion des cartes** : `/admin/cards`
- **Gestion des paiements** : `/admin/payments`
- **Gestion des départements** : `/admin/departments`
- **Rapports** : `/admin/reports`
- **Paramètres** : `/admin/settings`

## 🛡️ Sécurité

### **Protection des routes admin**
- Toutes les routes `/admin/*` sont protégées par `AdminRoute`
- Seuls les utilisateurs avec `role: 'admin'` peuvent accéder
- Redirection automatique vers `/admin/login` si non autorisé

### **Vérification du rôle**
```typescript
// Dans AdminRoute.tsx
if (!user || user.role !== 'admin') {
  return <Navigate to="/admin/login" replace />;
}
```

## 📋 Création d'un Compte Admin

### **Méthode 1 : Via Supabase Dashboard**
1. Allez sur [supabase.com](https://supabase.com)
2. Connectez-vous à votre projet
3. **Authentication** → **Users**
4. Cliquez sur un utilisateur existant
5. **Edit** → **User Metadata**
6. Ajoutez : `{"role": "admin"}`
7. **Save**

### **Méthode 2 : Via SQL**
```sql
-- Dans Supabase SQL Editor
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb), 
  '{role}', 
  '"admin"'
) 
WHERE email = 'admin@iut.com';
```

### **Méthode 3 : Via l'application**
1. Créez un compte normal via `/login`
2. Connectez-vous à Supabase
3. Changez le rôle en admin (méthode 1 ou 2)

## 🔄 Navigation

### **Depuis l'espace étudiant**
- Les étudiants ne peuvent pas accéder à `/admin/*`
- Redirection automatique vers leur dashboard

### **Depuis l'espace admin**
- Les admins peuvent accéder à toutes les fonctionnalités
- Navigation via le menu latéral admin

## 🚨 Dépannage

### **Problème : "Accès refusé"**
- Vérifiez que l'utilisateur a le rôle `admin`
- Vérifiez les variables d'environnement Supabase
- Vérifiez la connexion à la base de données

### **Problème : Page blanche**
- Vérifiez les logs de la console navigateur
- Vérifiez les logs Vercel
- Vérifiez que tous les composants admin sont bien importés

### **Problème : Erreur de route**
- Vérifiez que la route `/admin/login` est bien définie
- Vérifiez que `AdminLogin` est bien importé

## 📱 Interface Admin

### **Fonctionnalités disponibles**
- ✅ **Dashboard** : Vue d'ensemble
- ✅ **Étudiants** : Gestion des comptes étudiants
- ✅ **Cartes** : Gestion et impression des cartes
- ✅ **Paiements** : Suivi des paiements
- ✅ **Départements** : Gestion des départements
- ✅ **Rapports** : Statistiques et rapports
- ✅ **Paramètres** : Configuration système

### **Navigation**
- Menu latéral avec icônes
- Breadcrumbs pour la navigation
- Responsive design

## 🔧 Configuration

### **Variables d'environnement requises**
```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anon_supabase
```

### **Base de données**
- Table `users` avec colonne `role`
- RLS (Row Level Security) activé
- Politiques de sécurité configurées

## 📊 Monitoring

### **Logs de connexion**
```javascript
// Dans AdminRoute.tsx
console.log('🔐 AdminRoute - Vérification de l\'authentification:', {
  user: user ? { id: user.id, email: user.email, role: user.role } : null
});
```

### **Vérification des accès**
- Console navigateur pour les logs
- Network tab pour les requêtes
- Supabase logs pour les authentifications

## 🚀 Déploiement

### **Vercel**
1. Push sur GitHub
2. Vercel déploie automatiquement
3. Variables d'environnement configurées
4. Test de l'accès admin

### **URLs finales**
- **App principale** : `https://votre-app.vercel.app/`
- **Admin login** : `https://votre-app.vercel.app/admin/login`
- **Admin dashboard** : `https://votre-app.vercel.app/admin/dashboard`

---

**💡 Conseil** : Testez toujours l'accès admin après chaque déploiement pour vous assurer que tout fonctionne correctement. 