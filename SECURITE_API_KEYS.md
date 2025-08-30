# Sécurisation des Clés API

## 🔒 Améliorations de sécurité implémentées

Cette application a été sécurisée pour éviter l'exposition des clés API sensibles dans le bundle client JavaScript.

## 📋 Changements effectués

### ✅ Google Books API - Sécurisée

**Avant** : 
- Clé exposée côté client via `NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY`
- Accessible dans le bundle JavaScript (risque de sécurité)

**Après** :
- Clé stockée côté serveur uniquement : `GOOGLE_BOOKS_API_KEY` (sans NEXT_PUBLIC_)
- API route dédiée : `/api/books/search`
- Appels sécurisés depuis le client vers notre API

### 🔄 Supabase - Architecture maintenue

**Décision** : Conservation de l'architecture actuelle
- `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` conservées
- **Justification** : Supabase est conçu pour fonctionner côté client
- **Sécurité** : Assurée par Row Level Security (RLS) côté base de données

## 🛠️ Configuration requise

### Variables d'environnement (.env.local)

```bash
# Supabase (côté client) - CONSERVÉES
NEXT_PUBLIC_SUPABASE_URL=votre_url_projet_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anonyme_supabase

# Google Books API (côté serveur) - NOUVELLE
GOOGLE_BOOKS_API_KEY=votre_cle_google_books_api
```

### ⚠️ Important
- **NE PAS** préfixer `GOOGLE_BOOKS_API_KEY` avec `NEXT_PUBLIC_`
- **GARDER** le préfixe `NEXT_PUBLIC_` pour les clés Supabase
- Redémarrer le serveur après modification des variables

## 🔧 Architecture technique

### API Route Google Books

```
Client → /api/books/search → Google Books API → Client
```

**Fichier** : `src/app/api/books/search/route.ts`

**Fonctionnalités** :
- Recherche par titre, auteur, ou ISBN
- Fallback OpenLibrary → Google Books
- Gestion d'erreurs robuste
- Format de réponse standardisé

### Utilisation côté client

```typescript
// Ancienne méthode (supprimée)
const apiKey = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY;
const response = await fetch(`https://www.googleapis.com/books/v1/volumes?key=${apiKey}`);

// Nouvelle méthode (sécurisée)
const response = await fetch(`/api/books/search?q=${query}&type=${type}`);
```

## 📊 Bénéfices de sécurité

### ✅ Avantages

1. **Clé protégée** : Google Books API key non exposée publiquement
2. **Contrôle d'accès** : Possibilité d'ajouter rate limiting, auth
3. **Logs centralisés** : Monitoring des requêtes côté serveur
4. **Flexibilité** : Possibilité de changer de provider sans impact client

### 🔍 Pourquoi Supabase reste côté client

1. **Architecture by design** : Supabase est conçu pour cela
2. **Clé anon publique** : Par nature non sensible
3. **RLS Security** : Sécurité assurée par les politiques base de données
4. **Fonctionnalités temps réel** : Subscriptions, auth state changes
5. **Performance** : Pas de latence supplémentaire

## 🧪 Tests de sécurité

### Vérification de l'exposition des clés

1. **Ouvrir les outils développeur**
2. **Onglet Sources** → Rechercher "GOOGLE_BOOKS_API_KEY"
3. **✅ Résultat attendu** : Aucune occurrence trouvée
4. **⚠️ Si trouvé** : Vérifier que la variable n'a pas le préfixe NEXT_PUBLIC_

### Test de l'API route

```bash
# Test local
curl "http://localhost:3000/api/books/search?q=javascript&type=title"

# Réponse attendue
{
  "data": [...],
  "source": "openlibrary" | "googlebooks"
}
```

## 🚨 Bonnes pratiques

### ✅ À faire

- Utiliser notre API route pour les recherches de livres
- Garder les clés Supabase avec NEXT_PUBLIC_ (par design)
- Toujours redémarrer après modification des variables d'environnement
- Vérifier régulièrement l'exposition des clés dans le bundle

### ❌ À éviter

- Ajouter NEXT_PUBLIC_ à des clés sensibles
- Exposer directement les clés API dans le code client
- Contourner l'API route pour appeler directement Google Books
- Modifier l'architecture Supabase sans comprendre les implications RLS

## 📞 Support

### Si problèmes de recherche de livres

1. Vérifier que `GOOGLE_BOOKS_API_KEY` est définie (sans NEXT_PUBLIC_)
2. Redémarrer le serveur de développement
3. Vérifier les logs serveur dans la console
4. Tester l'API route directement

### Ressources

- [Documentation Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Supabase Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Google Books API Documentation](https://developers.google.com/books/docs/v1/using)

---

## ✅ Checklist de migration

- [ ] Variable `GOOGLE_BOOKS_API_KEY` ajoutée (sans NEXT_PUBLIC_)
- [ ] Serveur redémarr��
- [ ] Test de recherche de livres fonctionnel
- [ ] Vérification : clé non exposée dans bundle
- [ ] Variables Supabase conservées (avec NEXT_PUBLIC_)
- [ ] Documentation lue et comprise

🎉 **Félicitations !** Votre application est maintenant sécurisée selon les meilleures pratiques.
