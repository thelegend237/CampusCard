# API de création d'étudiant CampusCard

Cette API permet de créer des utilisateurs dans Supabase Auth de façon sécurisée.

## Installation

1. Copie le fichier `env.example` en `.env`
2. Remplis les variables d'environnement :
   - `SUPABASE_URL` : URL de ton projet Supabase
   - `SUPABASE_SERVICE_ROLE_KEY` : Clé service_role de Supabase (Project Settings > API)
   - `PORT` : Port du serveur (défaut: 4000)

## Lancement

```bash
npm start
```

Ou en mode développement avec rechargement automatique :
```bash
npm run dev
```

## Utilisation

L'API expose un endpoint POST `/api/create-student` qui accepte :
```json
{
  "email": "etudiant@example.com",
  "password": "motdepasse123"
}
```

Et retourne :
```json
{
  "user": {
    "id": "uuid-de-lutilisateur",
    "email": "etudiant@example.com",
    ...
  }
}
```

## Sécurité

⚠️ **IMPORTANT** : Cette API utilise la clé `service_role` qui ne doit JAMAIS être exposée côté client. Elle doit uniquement être utilisée côté serveur. 