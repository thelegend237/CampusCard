# CampusCard Creator

CampusCard Creator est une application web moderne permettant aux étudiants de générer, visualiser et télécharger leur carte d'étudiant en ligne, tout en offrant aux administrateurs un tableau de bord pour la gestion des étudiants, des cartes et des paiements.

## Fonctionnalités principales

### Pour les étudiants
- **Inscription et connexion sécurisées** (via Supabase)
- **Génération de carte d'étudiant** (formulaire, upload photo, validation des infos)
- **Paiement en ligne** (carte bancaire, Mobile Money MTN/ORANGE, suivi du statut)
- **Visualisation de la carte** (dashboard + page dédiée avec flip 3D recto/verso)
- **Téléchargement de la carte en PDF** (via jsPDF)
- **Historique des paiements et cartes**
- **Notifications** (affichage dans le dashboard)
- **Support et gestion du profil**

### Pour les administrateurs
- **Back office indépendant du front office** (layout, navigation, sécurité)
- **Tableau de bord global** (statistiques, activité récente)
- **Gestion des paiements** (validation, suivi, historique)
- **Gestion des départements et programmes**
- **Rapports et export PDF**
- **Paramétrage avancé (policies, sécurité, notifications)**

## Architecture du projet

```
├── src/
│   ├── App.tsx                # Point d'entrée principal, routes et protections
│   ├── main.tsx               # Bootstrap React
│   ├── components/            # Composants réutilisables
│   ├── contexts/              # Contextes globaux (authentification)
│   ├── lib/                   # Configuration Supabase
│   ├── pages/                 # Pages principales (étudiant, admin, login, accueil)
│   │   └── student/           # Pages étudiantes (Dashboard, CardGeneration, StudentCardView...)
│   │   └── admin/             # Pages admin (Dashboard, Payments...)
│   ├── types/                 # Définition des types TypeScript (User, Card, Payment...)
│   ├── utils/                 # Fonctions utilitaires (génération PDF, etc.)
│   └── index.css, vite-env.d.ts
├── public/
├── package.json               # Dépendances et scripts
├── vite.config.ts             # Configuration Vite
├── tailwind.config.js         # Configuration Tailwind CSS
└── ...
```

## Technologies utilisées
- **React 18** (TypeScript)
- **Vite** (développement et build)
- **Tailwind CSS** (UI moderne et responsive)
- **Supabase** (authentification, base de données, API, Storage)
- **jsPDF & html2canvas** (génération de PDF)
- **React Router v6** (navigation)
- **ESLint** (qualité du code)

## Structure des routes principales

- `/` : Accueil
- `/login` : Connexion/Inscription
- `/dashboard` : Tableau de bord étudiant (routes protégées)
  - `/dashboard/payment-status` : Statut et historique des paiements
  - `/dashboard/card-generation` : Génération de la carte
  - `/dashboard/history` : Historique
  - `/dashboard/settings` : Paramètres
  - `/dashboard/support` : Support
  - `/dashboard/student/card-view` : **Vue détaillée de la carte (recto/verso, flip 3D)**
- `/student/card-view` : **Accès direct à la vue détaillée de la carte**
- `/admin` : Tableau de bord admin (routes protégées, accès admin uniquement)
  - `/admin/dashboard`, `/admin/payments`, ...

## Séparation back office / front office
- **Le back office admin est séparé du front office étudiant** (layout, navigation, policies, dépendances).
- **Protection des routes admin** via une logique dédiée (seuls les utilisateurs avec le rôle `admin` peuvent accéder à `/admin/*`).
- **Layout admin dédié** avec menu, header, couleurs et navigation propres à l'admin.
- **Aucune page admin n'est accessible ou importée côté front office.**

## Sécurité et policies Supabase
- **RLS (Row Level Security) activé** sur toutes les tables sensibles.
- **Policies Supabase** :
  - Les étudiants ne voient que leurs propres données (`auth.uid() = userid`)
  - Les admins peuvent voir toutes les données (policy spécifique sur chaque table, sans récursion sur `users`)
  - Voir le dossier `supabase/scheme.txt` et le script SQL fourni pour la gestion des policies.
- **Stockage sécurisé des photos** via Supabase Storage (bucket `avatar`)
- **Gestion des rôles** : le champ `role` dans la table `users` (`student` ou `admin`)

## Gestion des erreurs courantes
- **Erreur de récursion infinie sur policies** : ne jamais faire de sous-requête sur `users` dans une policy sur la table `users`.
- **Accès admin** : pour voir tous les utilisateurs, il faut une policy SELECT permissive ou utiliser le rôle dans le JWT.
- **Accès refusé** : vérifier que le rôle de l'utilisateur est bien `admin` dans la table `users`.
- **Connexion Supabase** : vérifier que le projet est actif et que les clés/URL sont correctes.

## Modèles de données principaux (extraits réels)

### Utilisateur (`users`)
- `id` (uuid, correspond à l'auth Supabase)
- `email`, `role` (`student` | `admin`), `firstname`, `lastname`, `studentid`, `department`, `program`, `avatar`, `dateofbirth`, ...

### Carte (`cards`)
- `id`, `userid`, `studentid`, `firstname`, `lastname`, `department`, `program`, `avatar`, `issueddate`, `expirydate`, `status` (`pending` | `approved` | `rejected`), ...

### Paiement (`payments`)
- `id`, `userid`, `amount`, `description`, `status` (`pending` | `approved` | `rejected`), `paymentmethod` (`card` | `mtn` | `orange`), `phone`, `created_at`, ...

### Notification (`notifications`)
- `id`, `userid`, `title`, `message`, `type`, `read`, `created_at`

## Flux utilisateur étudiant
1. **Inscription/connexion**
2. **Remplissage du formulaire de génération de carte** (infos + photo)
3. **Validation des infos** (création de la carte en BDD, statut `pending`)
4. **Paiement en ligne** (choix de la méthode, enregistrement du paiement, statut `pending`)
5. **Validation du paiement par l'admin** (statut `approved`)
6. **La carte devient visible et téléchargeable (PDF) dans le dashboard**
7. **Vue détaillée de la carte** (recto/verso, flip 3D)

## Flux utilisateur admin
1. **Connexion en tant qu'admin**
2. **Accès au dashboard admin**
3. **Validation des paiements** (changement du statut en `approved`)
4. **Gestion des départements, rapports**

## Génération et visualisation de la carte
- **Composant dédié** pour la carte avec effet flip 3D (recto/verso)
- **Téléchargement PDF** via bouton (utilise les données de la BDD)
- **Photo d'identité** affichée si présente, sinon avatar par défaut

## Points de sécurité et bonnes pratiques
- **RLS activé** sur toutes les tables sensibles
- **Aucune donnée sensible n'est exposée sans authentification**
- **Bucket Storage privé** (policies adaptées)
- **Validation des rôles côté client ET côté BDD**
- **Séparation stricte du code et des layouts admin/front**

## Prise en main rapide
- Cloner le repo, installer les dépendances, configurer `.env` avec les clés Supabase
- Lancer le serveur avec `npm run dev`
- Créer un utilisateur admin dans la table `users` pour accéder à l'admin
- Appliquer les policies SQL fournies dans le dossier `supabase/`
- Tester le flux complet étudiant/admin

## Contribution
Les contributions sont les bienvenues ! Merci de créer une issue ou une pull request.

## Licence
MIT 

## Déploiement sur Vercel

Ce projet est prêt pour un déploiement sur [Vercel](https://vercel.com/).

### Étapes :
1. Poussez votre code sur un repository GitHub, GitLab ou Bitbucket.
2. Connectez-vous sur [vercel.com](https://vercel.com/) et importez votre repository.
3. Vercel détectera automatiquement Vite et utilisera la commande `npm run build`.
4. Le dossier de sortie est `dist` (configuré dans `vercel.json`).
5. Ajoutez vos variables d'environnement (ex : SUPABASE_URL, SUPABASE_ANON_KEY) dans l'onglet "Environment Variables" du dashboard Vercel.
6. Lancez le déploiement !

Aucune configuration supplémentaire n'est requise pour un projet Vite standard.

Pour des besoins avancés (redirections, headers, etc.), modifiez le fichier `vercel.json` à la racine du projet. 