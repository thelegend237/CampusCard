# 🔧 Diagnostic - Page Blanche Admin

## 🎯 Problème
Vous voyez une page blanche quand vous accédez à `/admin/login`

## 🔍 Étapes de Diagnostic

### 1. **Testez la page de test**
Allez sur : `http://localhost:5173/admin/test`

**Si ça marche** → Le routage fonctionne, le problème est dans AdminLoginPage
**Si ça ne marche pas** → Le problème est dans le routage

### 2. **Vérifiez la console navigateur**
1. Ouvrez les outils de développement (F12)
2. Allez dans l'onglet **Console**
3. Allez sur `/admin/login`
4. Regardez les erreurs

### 3. **Erreurs courantes**

#### Erreur : "Cannot find module"
```
Error: Cannot find module '../admin/src/pages/AdminLogin'
```
**Solution** : Utilisez la nouvelle page `AdminLoginPage` dans `src/pages/`

#### Erreur : "useAuth is not a function"
```
Error: useAuth is not a function
```
**Solution** : Vérifiez que `AuthContext` est bien configuré

#### Erreur : "React is not defined"
```
Error: React is not defined
```
**Solution** : Vérifiez les imports React

## 🛠️ Solutions

### **Solution 1 : Utiliser la page de test**
1. Allez sur `/admin/test`
2. Si ça marche, cliquez sur le lien vers `/admin/login`
3. Cela nous dira si le problème est dans le routage ou la page

### **Solution 2 : Vérifier les imports**
```typescript
// ✅ Correct
import AdminLoginPage from './pages/AdminLoginPage';

// ❌ Incorrect (peut causer des erreurs)
import AdminLogin from '../admin/src/pages/AdminLogin';
```

### **Solution 3 : Vérifier AuthContext**
Assurez-vous que `AuthContext` est bien configuré :
```typescript
// Dans src/contexts/AuthContext.tsx
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

### **Solution 4 : Page de fallback**
Si rien ne marche, créez une page simple :
```typescript
const SimpleAdminLogin = () => {
  return (
    <div className="min-h-screen bg-blue-600 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg">
        <h1>Admin Login - Test</h1>
        <p>Si vous voyez ceci, le routage fonctionne !</p>
      </div>
    </div>
  );
};
```

## 📋 Checklist de Diagnostic

- [ ] **Page de test** : `/admin/test` fonctionne-t-elle ?
- [ ] **Console** : Y a-t-il des erreurs JavaScript ?
- [ ] **Network** : Les fichiers sont-ils chargés ?
- [ ] **Imports** : Tous les imports sont-ils corrects ?
- [ ] **AuthContext** : Est-il bien configuré ?
- [ ] **Variables d'environnement** : Supabase est-il configuré ?

## 🚨 Solutions d'Urgence

### **Si rien ne marche**
1. **Redémarrez le serveur de développement** :
   ```bash
   npm run dev
   ```

2. **Videz le cache du navigateur** :
   - Ctrl+Shift+R (hard refresh)
   - Ou ouvrez en navigation privée

3. **Vérifiez les variables d'environnement** :
   ```env
   VITE_SUPABASE_URL=https://votre-projet.supabase.co
   VITE_SUPABASE_ANON_KEY=votre_cle_anon_supabase
   ```

## 📞 Logs Utiles

### **Dans AdminLoginPage**
```typescript
console.log('🔍 AdminLoginPage - Composant chargé');
console.log('🔍 AuthContext:', useAuth());
```

### **Dans AdminRoute**
```typescript
console.log('🔐 AdminRoute - Vérification:', { user, loading });
```

### **Dans App.tsx**
```typescript
console.log('🚀 App.tsx - Routes configurées');
```

## 🎯 Prochaines Étapes

1. **Testez `/admin/test`** d'abord
2. **Vérifiez la console** pour les erreurs
3. **Dites-moi ce que vous voyez** dans les logs
4. **Je vous aiderai** à résoudre le problème spécifique

---

**💡 Conseil** : Commencez toujours par la page de test pour isoler le problème ! 