# Pet Health App — Tamagotchi Mobile

App mobile cross-platform (iOS, Android, Web) de simulation d'animal virtuel. Local-only, pas d'auth.

## Tech Stack

- **Runtime**: Expo SDK 54, React Native 0.81, React 19
- **Language**: TypeScript (strict mode)
- **Routing**: expo-router 6 (file-based, Stack navigation)
- **UI**: react-native-paper (Material Design)
- **State**: zustand 5
- **DB native**: expo-sqlite 16 (SQLite)
- **DB web**: localStorage (fichiers `.web.ts`)
- **Image**: expo-image-picker 17
- **Experiments**: React Compiler activé, typedRoutes activé

## Commandes

- `npx expo start` — lancer le serveur de dev
- `npx tsc --noEmit` — vérifier les types (TOUJOURS faire après modification)
- `npx expo install <pkg>` — installer un package compatible Expo (ne PAS utiliser npm install pour les packages Expo)

## Architecture

```
app/                → Écrans (expo-router file-based routing)
components/         → Composants UI réutilisables (PetCard, HealthBar, ActionButtons)
database/           → Couche données (SQLite natif + localStorage web)
engine/             → Logique métier Tamagotchi (dégradation, actions)
store/              → State management Zustand
services/           → Services transversaux (notifications placeholder)
types/              → Interfaces TypeScript
```

## Pattern plateforme-spécifique

Metro résout automatiquement les fichiers par plateforme :
- `fichier.ts` → utilisé sur iOS/Android
- `fichier.web.ts` → utilisé sur Web

Les deux versions DOIVENT exporter exactement les mêmes fonctions avec les mêmes signatures.
Fichiers concernés : `database/db.ts` et `database/petRepository.ts`.

## Base de données

Table unique `pets` :
```
id INTEGER PRIMARY KEY AUTOINCREMENT
name TEXT NOT NULL, type TEXT NOT NULL, race TEXT, age INTEGER, photo TEXT
hunger INTEGER (0-100, défaut 100)
thirst INTEGER (0-100, défaut 100)
mood INTEGER (0-100, défaut 100)
last_update INTEGER (timestamp ms)
created_at INTEGER (timestamp ms)
```

## Algorithme Tamagotchi

- Dégradation par heure : hunger −5, thirst −7, mood −3
- Actions : feed → hunger +30, water → thirst +30, play → mood +30
- Stats TOUJOURS clampées entre 0 et 100
- Dégradation calculée au chargement du pet (delta = now − last_update), PAS en continu
- Après calcul, last_update est mis à jour à now

## Routes

- `/` → liste des pets (index.tsx)
- `/add-pet` → formulaire création (add-pet.tsx)
- `/pet/[id]` → hub santé du pet (pet/[id].tsx)

## Conventions de code

- Composants React : PascalCase (fichier et nom)
- Fonctions utilitaires : camelCase
- Types/Interfaces : PascalCase, définis dans `types/`
- Imports : chemins relatifs (`../store/petStore`)
- Pas de default export sauf pour les écrans et composants
- StyleSheet.create pour tous les styles

## DO NOT

- NE PAS utiliser `npm install` pour des packages Expo → utiliser `npx expo install`
- NE PAS importer expo-sqlite dans un fichier sans `.web.ts` alternatif (crash web)
- NE PAS oublier de clamper les stats à [0, 100]
- NE PAS stocker de secrets dans le code (app local-only)
- NE PAS ajouter de dépendances natives sans vérifier la compatibilité Expo Go
- NE PAS modifier les fichiers `.web.ts` sans mettre à jour le fichier `.ts` natif (et inversement)
- NE PAS utiliser `async/await` dans le rendu React directement — passer par le store Zustand

## Gotchas connus

1. **Port 8081 souvent occupé** → utiliser `npx expo start --port 8082`
2. **expo-image-picker ne fonctionne pas sur web** → prévoir un fallback ou input file
3. **Les photos sont des URIs locales** → elles ne survivent pas à une réinstallation
4. **localStorage web limité à ~5MB** → suffisant pour le MVP, pas pour la prod
5. **useFocusEffect** nécessaire pour rafraîchir la liste quand on revient sur l'écran d'accueil

## Roadmap MVP

- Phase 1 ✅ : CRUD pets, stats, actions, dégradation temps
- Phase 2 (à venir) : notifications push, thèmes, historique santé
