# 🌐 URLs d'Accès Admin - Résumé Rapide

## 🎯 Après Déploiement Vercel

### **Application Principale**
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

## 🔑 Connexion Admin

1. **Allez sur** : `https://votre-app.vercel.app/admin/login`
2. **Connectez-vous** avec :
   - Email : `admin@iut.com`
   - Mot de passe : (celui que vous avez configuré)
3. **Vous serez redirigé** vers : `/admin/dashboard`

## 📱 Pages Admin Disponibles

- **Dashboard** : `/admin/dashboard`
- **Étudiants** : `/admin/students`
- **Cartes** : `/admin/cards`
- **Paiements** : `/admin/payments`
- **Départements** : `/admin/departments`
- **Rapports** : `/admin/reports`
- **Paramètres** : `/admin/settings`

## 🛡️ Sécurité

- ✅ Routes protégées par `AdminRoute`
- ✅ Seuls les utilisateurs `role: 'admin'` peuvent accéder
- ✅ Redirection automatique si non autorisé

## 🚨 Si ça ne marche pas

1. **Vérifiez le rôle admin** dans Supabase
2. **Vérifiez les variables d'environnement** dans Vercel
3. **Vérifiez les logs** de la console navigateur

---

**💡 Conseil** : Gardez cette page en favori pour un accès rapide ! 