# 📚 Booker - Gestionnaire de bibliothèque personnelle

Une application moderne et intuitive pour gérer votre collection de livres avec un design réactif et de belles animations.

## ✨ Fonctionnalités

- **Gestion complète des livres** : Ajoutez, modifiez et supprimez des livres
- **Suivi de progression** : Marquez votre avancement de lecture avec un cercle de progression animé
- **Statuts de lecture** : À lire, En cours, Terminé
- **Recherche et filtres** : Trouvez rapidement vos livres par titre, auteur ou genre
- **Notes et évaluations** : Ajoutez des notes personnelles et notez vos livres
- **Statistiques** : Visualisez votre collection avec des statistiques détaillées
- **Design responsive** : Interface optimisée pour desktop et mobile
- **Animations fluides** : Transitions et animations modernes avec Framer Motion
- **Timer de lecture** : Chronométrez vos sessions de lecture avec statistiques
- **Synchronisation cloud** : Vos données sont sauvegardées et synchronisées via Supabase
- **Migration automatique** : Migration transparente depuis localStorage vers Supabase

## 🚀 Technologies utilisées

- **Next.js 15** - Framework React moderne
- **TypeScript** - Typage statique
- **Tailwind CSS** - Framework CSS utilitaire
- **Framer Motion** - Animations et transitions
- **Lucide React** - Icônes modernes
- **Headless UI** - Composants accessibles
- **Supabase** - Base de données et authentification en temps réel

## 🛠️ Installation et démarrage

1. **Cloner le projet**
   ```bash
   git clone <votre-repo>
   cd booker
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer Supabase**
   ```bash
   # Créez un fichier .env.local avec vos clés Supabase
   cp .env.example .env.local
   # Éditez .env.local avec vos vraies clés
   ```

4. **Lancer l'application**
   ```bash
   npm run dev
   ```

5. **Ouvrir dans le navigateur**
   ```
   http://localhost:3000
   ```

## 🗄️ Configuration Supabase

Cette application utilise Supabase comme backend. Consultez le guide détaillé de migration dans `MIGRATION_SUPABASE.md` pour :

1. Créer un projet Supabase
2. Configurer la base de données
3. Obtenir vos clés API
4. Migrer vos données existantes

## 📱 Utilisation

### Ajouter un livre
- Cliquez sur le bouton "Ajouter un livre" dans l'en-tête
- Remplissez les informations : titre, auteur, statut, pages, etc.
- Ajoutez une note et une évaluation si souhaité

### Gérer votre collection
- **Filtrer** : Utilisez les boutons de filtre pour voir les livres par statut
- **Rechercher** : Tapez dans la barre de recherche pour trouver un livre
- **Modifier** : Cliquez sur une carte de livre pour la modifier
- **Supprimer** : Utilisez le bouton de suppression dans chaque carte

### Suivre votre progression
- Le cercle de progression affiche automatiquement votre avancement
- Mettez à jour la page actuelle pour voir le progrès se modifier
- Les statistiques se mettent à jour en temps réel

## 🎨 Design

L'application utilise un design moderne avec :
- **Palette de couleurs** : Bleus, verts et gris pour un look professionnel
- **Animations** : Transitions fluides et micro-interactions
- **Responsive** : Adaptation parfaite sur tous les écrans
- **Accessibilité** : Interface intuitive et accessible

## 📊 Structure du projet

```
src/
├── app/
│   ├── globals.css      # Styles globaux et animations
│   ├── layout.tsx       # Layout principal avec AuthProvider
│   ├── page.tsx         # Page d'accueil
│   └── not-found.tsx    # Page 404
├── components/
│   ├── AuthProvider.tsx # Provider d'authentification
│   ├── BookCard.tsx     # Carte de livre
│   ├── BookForm.tsx     # Formulaire d'ajout/modification
│   ├── ProgressCircle.tsx # Cercle de progression
│   ├── ReadingTimer.tsx # Timer de lecture
│   └── Stats.tsx        # Composant de statistiques
├── hooks/
│   ├── useAuth.ts       # Hook d'authentification
│   ├── useBooks.ts      # Hook de gestion des livres
│   └── useReadingSessions.ts # Hook des sessions de lecture
├── lib/
│   └── supabase.ts      # Configuration client Supabase
└── types/
    ├── book.ts          # Types des livres
    ├── reading-session.ts # Types des sessions
    └── supabase.ts      # Types de base de données
```

## 🔧 Scripts disponibles

- `npm run dev` - Lance le serveur de développement
- `npm run build` - Construit l'application pour la production
- `npm run start` - Lance l'application en production
- `npm run lint` - Vérifie le code avec ESLint

## 📝 Fonctionnalités à venir

- [x] Synchronisation cloud (Supabase)
- [x] Timer de lecture avec statistiques
- [ ] Authentification avec email/password
- [ ] Import/export de données
- [ ] Recommandations de livres
- [ ] Mode sombre
- [ ] Notifications de rappel
- [ ] Partage de bibliothèque

---

**Booker** - Votre bibliothèque personnelle, modernisée ✨
