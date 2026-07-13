import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const baseUrl = process.env.FORGE_API_URL || "http://localhost:8080";
    
    // Nous appelons directement la documentation OpenAPI du backend en demandant la version française
    const response = await fetch(`${baseUrl}/v3/api-docs`, {
      headers: {
        'Accept-Language': 'fr'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération de la spécification OpenAPI: ${response.status}`);
    }
    
    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[API Forge Catalog]", error);
    return NextResponse.json(
      { error: "Impossible de récupérer le catalogue des API Forge." },
      { status: 500 }
    );
  }
}
