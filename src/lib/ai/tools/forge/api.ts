export async function callForgeApi(endpoint: string, defaultErrorMessage: string = "Erreur de communication avec l'API") {
  try {
    const baseUrl = process.env.FORGE_API_URL || "http://localhost:8080";
    const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    
    const response = await fetch(`${baseUrl}${path}`);
    
    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return {
      success: true,
      data
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || defaultErrorMessage
    };
  }
}
