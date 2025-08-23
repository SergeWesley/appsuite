import { NextRequest, NextResponse } from "next/server";
import { kafkaService } from "@/lib/server/kafka";

interface UserConnectionEventRequest {
  userId: string;
  email: string;
  eventType: "connection" | "disconnection";
  sessionId: string;
  userAgent?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: UserConnectionEventRequest = await request.json();

    // Validation des données requises
    if (!body.userId || !body.email || !body.eventType || !body.sessionId) {
      return NextResponse.json(
        {
          error:
            "Données manquantes: userId, email, eventType et sessionId sont requis",
        },
        { status: 400 },
      );
    }

    // Validation du type d'événement
    if (!["connection", "disconnection"].includes(body.eventType)) {
      return NextResponse.json(
        { error: 'eventType doit être "connection" ou "disconnection"' },
        { status: 400 },
      );
    }

    // Créer l'événement selon le type
    let event;
    if (body.eventType === "connection") {
      event = kafkaService.createConnectionEvent(
        body.userId,
        body.email,
        body.sessionId,
      );
    } else {
      event = kafkaService.createDisconnectionEvent(
        body.userId,
        body.email,
        body.sessionId,
      );
    }

    // Ajouter les métadonnées de la requête
    if (body.userAgent) {
      event.userAgent = body.userAgent;
    }

    // Obtenir l'adresse IP du client
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded
      ? forwarded.split(",")[0]
      : request.headers.get("x-real-ip") || "unknown";
    event.ipAddress = ip;

    // Envoyer l'événement à Kafka
    await kafkaService.sendUserConnectionEvent(event);

    return NextResponse.json({
      success: true,
      message: `Événement ${body.eventType} envoyé avec succès`,
      eventId: event.sessionId,
      timestamp: event.timestamp,
    });
  } catch (error) {
    console.error(
      "Erreur lors du traitement de l'événement utilisateur:",
      error,
    );

    return NextResponse.json(
      {
        error: "Erreur interne du serveur",
        details:
          process.env.NODE_ENV === "development"
            ? (error as Error).message
            : undefined,
      },
      { status: 500 },
    );
  }
}

// Endpoint pour vérifier le statut de la connexion Kafka
export async function GET() {
  try {
    // Test de connexion Kafka
    await kafkaService.connect();

    return NextResponse.json({
      status: "healthy",
      kafka: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        kafka: "disconnected",
        error: (error as Error).message,
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}
