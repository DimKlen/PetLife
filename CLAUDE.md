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

Table `pets` :
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
- Actions : feed → hunger +30 | water → thirst +35 | play → mood +25 / hunger −10
- Stats TOUJOURS clampées entre 0 et 100
- overallHealth = (hunger + thirst + mood) / 3
- Dégradation calculée au chargement du pet (delta = now − last_update), PAS en continu
- Après calcul, last_update est mis à jour à now

## Routes

- `/` → liste des pets via drawer (app/(drawer)/index.tsx)
- `/add-pet` → formulaire création (add-pet.tsx)
- `/pet-hub/[id]` → hub santé du pet (pet-hub/[id].tsx)
- `/edit-pet/[id]` → formulaire modification du pet (edit-pet/[id].tsx)

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
6. **jest-expo doit correspondre au SDK Expo** → `jest-expo@54` pour `expo@54`, sinon erreur d'import runtime
7. **jest@29 requis avec jest-expo@54** → `jest@30` est incompatible, utiliser `jest@29`
8. **react-test-renderer doit être épinglé** → même version exacte que `react` (ex: `19.1.0`)
9. **Menu de react-native-paper non testable directement** → utilise un Portal non capturé par le test renderer. Mocker avec `jest.mock` + `Object.assign` pour préserver `Menu.Item`. Wrapper les tests avec `<SafeAreaProvider>` et `<PaperProvider>`
10. **gh CLI non trouvé dans bash** → ajouter `export PATH="$PATH:/c/Program Files/GitHub CLI"` avant d'utiliser `gh`
11. **DateTimePicker ne s'affiche pas dans un Portal Paper** → utiliser `Modal as RNModal` (React Native natif) pour envelopper le DateTimePicker, hors du Portal
12. **`branches: ['*']` en GitHub Actions ne matche pas `feature/xxx`** → utiliser `['**']` pour inclure les branches avec slash
13. **Ne pas avoir `app/index.tsx` et `app/(drawer)/index.tsx` simultanément** → conflit de route, Expo Router prend le fichier racine et casse le drawer
14. **Après "Update branch" GitHub sur une PR** → toujours relancer `npm install` et committer le `package-lock.json` si des dépendances diffèrent entre les branches
15. **Touchables imbriqués** → ne pas imbriquer `TouchableOpacity` dans `TouchableOpacity`. Utiliser `Card onPress` (Paper) + `Pressable` (RN) pour les boutons internes d'une card cliquable

## Roadmap MVP

- Phase 1 ✅ : CRUD pets, stats, actions, dégradation temps
- Phase 2 (à venir) : notifications push, thèmes, historique santé
