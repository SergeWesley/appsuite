import { Kafka, Producer, KafkaMessage } from 'kafkajs';

interface UserConnectionEvent {
  userId: string;
  email: string;
  timestamp: string;
  eventType: 'connection' | 'disconnection';
  sessionId: string;
  userAgent?: string;
  ipAddress?: string;
}

class KafkaService {
  private kafka: Kafka;
  private producer: Producer | null = null;
  private isConnected = false;

  constructor() {
    // Configuration pour RedPanda (compatible Kafka)
    this.kafka = new Kafka({
      clientId: process.env.KAFKA_CLIENT_ID || 'booker-app',
      brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
      // Configuration spécifique pour RedPanda si nécessaire
      retry: {
        initialRetryTime: 100,
        retries: 8
      },
      connectionTimeout: 3000,
      requestTimeout: 30000,
    });

    // Initialiser la connexion lors de la création de l'instance
    this.initializeConnection();
  }

  private async initializeConnection(): Promise<void> {
    try {
      await this.connect();
    } catch (error) {
      console.warn('Impossible de se connecter à Kafka au démarrage:', error);
      // L'application continue de fonctionner même si Kafka n'est pas disponible
    }
  }

  async connect(): Promise<void> {
    try {
      if (!this.producer) {
        this.producer = this.kafka.producer({
          allowAutoTopicCreation: true,
          transactionTimeout: 30000,
        });
      }

      if (!this.isConnected) {
        await this.producer.connect();
        this.isConnected = true;
        console.log('Kafka producer connecté avec succès');
      }
    } catch (error) {
      console.error('Erreur lors de la connexion à Kafka:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.producer && this.isConnected) {
        await this.producer.disconnect();
        this.isConnected = false;
        console.log('Kafka producer déconnecté');
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion de Kafka:', error);
    }
  }

  async sendUserConnectionEvent(event: UserConnectionEvent): Promise<void> {
    try {
      await this.ensureConnected();

      if (!this.producer) {
        throw new Error('Producer Kafka non initialisé');
      }

      const message = {
        key: event.userId,
        value: JSON.stringify({
          ...event,
          source: 'booker-app',
          environment: process.env.NODE_ENV || 'development',
        }),
        timestamp: Date.now().toString(),
      };

      await this.producer.send({
        topic: process.env.KAFKA_USER_EVENTS_TOPIC || 'user-connection-events',
        messages: [message],
      });

      console.log(`Événement ${event.eventType} envoyé pour l'utilisateur ${event.userId}`);
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'événement Kafka:', error);
      throw error; // Propager l'erreur pour que l'API puisse la gérer
    }
  }

  private async ensureConnected(): Promise<void> {
    if (!this.isConnected) {
      await this.connect();
    }
  }

  // Méthode utilitaire pour créer un événement de connexion
  createConnectionEvent(userId: string, email: string, sessionId: string): UserConnectionEvent {
    return {
      userId,
      email,
      timestamp: new Date().toISOString(),
      eventType: 'connection',
      sessionId,
    };
  }

  // Méthode utilitaire pour créer un événement de déconnexion
  createDisconnectionEvent(userId: string, email: string, sessionId: string): UserConnectionEvent {
    return {
      userId,
      email,
      timestamp: new Date().toISOString(),
      eventType: 'disconnection',
      sessionId,
    };
  }

  // Vérifier si le service est connecté
  isServiceConnected(): boolean {
    return this.isConnected;
  }
}

// Instance singleton
export const kafkaService = new KafkaService();

// Hook de nettoyage pour fermer la connexion lors de l'arrêt de l'application
process.on('SIGINT', async () => {
  await kafkaService.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await kafkaService.disconnect();
  process.exit(0);
});
