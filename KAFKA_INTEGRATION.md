# Intégration Kafka avec RedPanda

Ce projet intègre un client Kafka pour envoyer des événements de connexion/déconnexion des utilisateurs vers un serveur RedPanda.

## Configuration

### Variables d'environnement

Copiez le fichier `.env.example` vers `.env.local` et configurez les variables suivantes :

```bash
# Configuration Kafka/RedPanda
KAFKA_CLIENT_ID=booker-app                    # ID du client Kafka
KAFKA_BROKER=localhost:9092                   # Adresse du broker RedPanda
KAFKA_USER_EVENTS_TOPIC=user-connection-events # Topic pour les événements utilisateur
```

### Configuration RedPanda

Pour démarrer RedPanda localement avec Docker :

```bash
docker run -d --name redpanda \
  -p 9092:9092 \
  -p 9644:9644 \
  docker.redpanda.com/redpandadata/redpanda:latest \
  redpanda start \
  --smp 1 \
  --memory 1G \
  --reserve-memory 0M \
  --overprovisioned \
  --node-id 0 \
  --kafka-addr internal://0.0.0.0:9092,external://0.0.0.0:19092 \
  --advertise-kafka-addr internal://redpanda:9092,external://localhost:19092 \
  --pandaproxy-addr internal://0.0.0.0:8082,external://0.0.0.0:18082 \
  --advertise-pandaproxy-addr internal://redpanda:8082,external://localhost:18082
```

Ou utilisez votre instance RedPanda existante en modifiant `KAFKA_BROKER` dans votre `.env.local`.

## Structure des événements

Les événements envoyés au topic Kafka ont la structure suivante :

```typescript
interface UserConnectionEvent {
  userId: string;           // ID unique de l'utilisateur
  email: string;           // Email de l'utilisateur
  timestamp: string;       // Timestamp ISO de l'événement
  eventType: 'connection' | 'disconnection'; // Type d'événement
  sessionId: string;       // ID unique de la session
  userAgent?: string;      // User agent du navigateur
  ipAddress?: string;      // Adresse IP (future fonctionnalité)
  source: 'booker-app';    // Source de l'événement
  environment: string;     // Environnement (development/production)
}
```

## Utilisation

L'intégration est automatique :

1. **Connexion utilisateur** : Un événement `connection` est envoyé lors de la connexion
2. **Déconnexion utilisateur** : Un événement `disconnection` est envoyé lors de la déconnexion
3. **Gestion des erreurs** : Si Kafka n'est pas disponible, l'application continue de fonctionner normalement

## Architecture

### Fichiers créés/modifiés :

- `src/lib/server/kafka.ts` : Service Kafka côté serveur
- `src/app/api/events/user-connection/route.ts` : Route API pour gérer les événements
- `src/hooks/useKafka.ts` : Hook React pour communiquer avec l'API
- `src/hooks/useAuth.ts` : Hook d'authentification modifié pour envoyer les événements
- `.env.local` : Variables d'environnement
- `.env.example` : Exemple de configuration

### Flux des données :

1. L'utilisateur se connecte/déconnecte
2. Le hook `useAuth` détecte le changement d'état
3. Le hook `useKafka` envoie une requête HTTP à l'API `/api/events/user-connection`
4. L'API valide les données et utilise le service `kafkaService` côté serveur
5. Le service se connecte à RedPanda et envoie l'événement
6. L'événement est publié dans le topic configuré

### Avantages de l'architecture côté serveur :

- **Sécurité** : Les credentials Kafka ne sont pas exposés côté client
- **Performance** : Connexions Kafka réutilisées côté serveur
- **Fiabilité** : Gestion centralisée des erreurs et retry logic
- **Conformité** : Respect des bonnes pratiques de sécurité

## Surveillance et debugging

### Logs

Les événements Kafka sont loggés dans la console :
- Connexions/déconnexions du producer
- Envoi d'événements réussis
- Erreurs de connexion ou d'envoi

### Commandes utiles pour RedPanda

```bash
# Lister les topics
docker exec redpanda rpk topic list

# Créer le topic manuellement (optionnel)
docker exec redpanda rpk topic create user-connection-events

# Consommer les événements pour test
docker exec redpanda rpk topic consume user-connection-events --print-headers
```

## Tolérance aux pannes

Le système est conçu pour être résilient :
- Si Kafka/RedPanda n'est pas disponible, l'authentification continue de fonctionner
- Les erreurs Kafka sont loggées mais n'interrompent pas l'expérience utilisateur
- Reconnexion automatique en cas de perte de connexion

## Sécurité

- Les événements ne contiennent pas de mots de passe ou d'informations sensibles
- Seuls l'ID utilisateur, l'email et les métadonnées de session sont transmis
- La configuration peut être étendue pour supporter l'authentification SASL si nécessaire
