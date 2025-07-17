# CampusCard Creator

CampusCard Creator est une application web moderne permettant aux étudiants de générer, visualiser et télécharger leur carte d'étudiant en ligne, tout en offrant aux administrateurs un tableau de bord complet pour la gestion des étudiants, des cartes et des paiements.

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
- **Tableau de bord global** (statistiques, activité récente)
- **Gestion des étudiants** (liste, suppression)
- **Gestion des cartes** (validation, émission, statut)
- **Gestion des paiements** (validation, suivi, historique)
- **Gestion des départements et programmes**
- **Rapports et export**

## Architecture du projet

```
├── src/
│   ├── App.tsx                # Point d'entrée principal, routes et protections
│   ├── main.tsx               # Bootstrap React
│   ├── components/            # Composants réutilisables (Layout, etc.)
│   ├── contexts/              # Contextes globaux (authentification)
│   ├── lib/                   # Configuration Supabase
│   ├── pages/                 # Pages principales (étudiant, admin, login, accueil)
│   │   └── student/           # Pages étudiantes (Dashboard, CardGeneration, StudentCardView...)
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
  - `/admin/dashboard`, `/admin/students`, `/admin/cards`, ...

## Logique d'accès et sécurité
- **Routes protégées** via le composant `ProtectedRoute` (redirige si non connecté ou non admin)
- **Policies Supabase** :
  - Les étudiants ne voient que leurs propres cartes/paiements (`auth.uid() = userid`)
  - Les admins peuvent voir toutes les données
- **Stockage sécurisé des photos** via Supabase Storage (bucket `avatar`)

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
4. **Validation/émission des cartes**
5. **Gestion des étudiants, départements, rapports**

## Génération et visualisation de la carte
- **Composant dédié** pour la carte avec effet flip 3D (recto/verso)
- **Téléchargement PDF** via bouton (utilise les données de la BDD)
- **Photo d'identité** affichée si présente, sinon avatar par défaut

## Points de sécurité et bonnes pratiques
- **RLS activé** sur toutes les tables sensibles
- **Aucune donnée sensible n'est exposée sans authentification**
- **Bucket Storage privé** (policies adaptées)
- **Validation des rôles côté client ET côté BDD**

## Prise en main rapide
- Cloner le repo, installer les dépendances, configurer `.env` avec les clés Supabase
- Lancer le serveur avec `npm run dev`
- Créer un utilisateur admin dans la table `users` pour accéder à l'admin
- Tester le flux complet étudiant/admin

## Contribution
Les contributions sont les bienvenues ! Merci de créer une issue ou une pull request.

## Licence
MIT 