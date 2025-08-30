import { NextRequest, NextResponse } from "next/server";

interface BookSuggestion {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  isbn?: string[];
  number_of_pages_median?: number;
  cover_i?: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const type = searchParams.get("type") || "title";

    if (!query) {
      return NextResponse.json(
        { error: "Paramètre de recherche manquant" },
        { status: 400 }
      );
    }

    // D'abord essayer OpenLibrary (gratuit)
    const openLibraryData = await searchOpenLibrary(query, type as "title" | "author" | "isbn");
    
    if (openLibraryData && openLibraryData.length > 0) {
      return NextResponse.json({ 
        data: openLibraryData, 
        source: "openlibrary" 
      });
    }

    // Fallback vers Google Books si OpenLibrary n'a pas de résultats
    const googleBooksData = await searchGoogleBooks(query, type as "title" | "author" | "isbn");
    
    return NextResponse.json({ 
      data: googleBooksData || [], 
      source: "googlebooks" 
    });

  } catch (error) {
    console.error("Erreur lors de la recherche de livres:", error);
    return NextResponse.json(
      { error: "Erreur lors de la recherche" },
      { status: 500 }
    );
  }
}

async function searchOpenLibrary(
  query: string,
  type: "title" | "author" | "isbn"
): Promise<BookSuggestion[]> {
  try {
    let apiUrl: string;

    if (type === "isbn") {
      apiUrl = `https://openlibrary.org/search.json?isbn=${encodeURIComponent(query)}&fields=key,title,author_name,first_publish_year,isbn,number_of_pages_median&limit=100`;
    } else {
      const searchParam = type === "title" ? "title" : "author";
      apiUrl = `https://openlibrary.org/search.json?${searchParam}=${encodeURIComponent(query)}&fields=key,title,author_name,first_publish_year,isbn,number_of_pages_median&limit=100`;
    }

    const response = await fetch(apiUrl);
    const data = await response.json();

    return data.docs || [];
  } catch (error) {
    console.error("Erreur avec OpenLibrary:", error);
    return [];
  }
}

async function searchGoogleBooks(
  query: string,
  type: "title" | "author" | "isbn"
): Promise<BookSuggestion[]> {
  try {
    const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
    if (!apiKey) {
      console.warn("Clé API Google Books non configurée");
      return [];
    }

    let searchQuery: string;
    if (type === "isbn") {
      searchQuery = `isbn:${query}`;
    } else if (type === "author") {
      searchQuery = `inauthor:${query}`;
    } else {
      searchQuery = `intitle:${query}`;
    }

    const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&maxResults=40&key=${apiKey}`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!data.items) {
      return [];
    }

    // Convertir le format Google Books vers le format OpenLibrary
    return data.items.map((item: any, index: number): BookSuggestion => {
      const volumeInfo = item.volumeInfo;
      const industryIdentifiers = volumeInfo.industryIdentifiers || [];
      const isbn =
        industryIdentifiers.find((id: any) => id.type === "ISBN_13")?.identifier ||
        industryIdentifiers.find((id: any) => id.type === "ISBN_10")?.identifier ||
        "";

      return {
        key: `google_${item.id}_${index}`,
        title: volumeInfo.title || "",
        author_name: volumeInfo.authors || [],
        first_publish_year: volumeInfo.publishedDate
          ? new Date(volumeInfo.publishedDate).getFullYear()
          : undefined,
        isbn: isbn ? [isbn] : [],
        number_of_pages_median: volumeInfo.pageCount,
      };
    });
  } catch (error) {
    console.error("Erreur avec Google Books:", error);
    return [];
  }
}
