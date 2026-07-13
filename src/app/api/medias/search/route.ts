import { NextRequest, NextResponse } from "next/server";

interface MediaSuggestion {
  id: number;
  title: string;
  original_title?: string;
  release_date?: string;
  first_air_date?: string;
  overview?: string;
  poster_path?: string;
  backdrop_path?: string;
  genre_ids?: number[];
  vote_average?: number;
  vote_count?: number;
  media_type?: "movie" | "tv";
  // Pour les séries TV
  name?: string;
  original_name?: string;
  // Pour la recherche de personnes
  known_for_department?: string;
  known_for?: MediaSuggestion[];
}

interface PersonSuggestion {
  id: number;
  name: string;
  known_for_department?: string;
  known_for?: MediaSuggestion[];
  profile_path?: string;
}

interface TMDBResponse {
  results: MediaSuggestion[] | PersonSuggestion[];
  total_pages: number;
  total_results: number;
}

interface GenreResponse {
  genres: { id: number; name: string }[];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const type = searchParams.get("type") || "title";
    const mediaType = searchParams.get("mediaType") || "all"; // movie, tv, all

    if (!query) {
      return NextResponse.json(
        { error: "Paramètre de recherche manquant" },
        { status: 400 }
      );
    }

    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Clé API TMDB non configurée" },
        { status: 500 }
      );
    }

    let results: MediaSuggestion[] = [];

    switch (type) {
      case "title":
        results = await searchByTitle(query, apiKey, mediaType);
        break;
      case "director":
      case "creator":
        results = await searchByPerson(query, apiKey, type);
        break;
      case "genre":
        results = await searchByGenre(query, apiKey, mediaType);
        break;
      default:
        return NextResponse.json(
          { error: "Type de recherche non supporté" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      data: results,
      source: "tmdb"
    });

  } catch (error) {
    console.error("Erreur lors de la recherche TMDB:", error);
    return NextResponse.json(
      { error: "Erreur lors de la recherche" },
      { status: 500 }
    );
  }
}

async function searchByTitle(
  query: string,
  apiKey: string,
  mediaType: string
): Promise<MediaSuggestion[]> {
  const results: MediaSuggestion[] = [];

  try {
    // Recherche de films si demandé
    if (mediaType === "all" || mediaType === "movie") {
      const movieUrl = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=fr-FR`;
      const movieResponse = await fetch(movieUrl);
      const movieData: TMDBResponse = await movieResponse.json();
      
      const movies = (movieData.results as MediaSuggestion[]).map(movie => ({
        ...movie,
        media_type: "movie" as const,
        title: movie.title || movie.original_title || "",
      }));
      results.push(...movies);
    }

    // Recherche de séries TV si demandé
    if (mediaType === "all" || mediaType === "tv") {
      const tvUrl = `https://api.themoviedb.org/3/search/tv?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=fr-FR`;
      const tvResponse = await fetch(tvUrl);
      const tvData: TMDBResponse = await tvResponse.json();
      
      const tvShows = (tvData.results as MediaSuggestion[]).map(show => ({
        ...show,
        media_type: "tv" as const,
        title: show.name || show.original_name || "",
        original_title: show.original_name,
        release_date: show.first_air_date,
      }));
      results.push(...tvShows);
    }

    // Tri par popularité (vote_count * vote_average)
    return results
      .sort((a, b) => {
        const scoreA = (a.vote_count || 0) * (a.vote_average || 0);
        const scoreB = (b.vote_count || 0) * (b.vote_average || 0);
        return scoreB - scoreA;
      })
      .slice(0, 20); // Limite à 20 résultats

  } catch (error) {
    console.error("Erreur lors de la recherche par titre:", error);
    return [];
  }
}

async function searchByPerson(
  query: string,
  apiKey: string,
  role: string
): Promise<MediaSuggestion[]> {
  try {
    // Tout d'abord, recherche de la personne
    const personUrl = `https://api.themoviedb.org/3/search/person?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=fr-FR`;
    const personResponse = await fetch(personUrl);
    const personData: TMDBResponse = await personResponse.json();

    const results: MediaSuggestion[] = [];

    // Pour chaque personne trouvée, récupération de ses crédits
    for (const person of personData.results as PersonSuggestion[]) {
      try {
        // Récupération des crédits de film
        const movieCreditsUrl = `https://api.themoviedb.org/3/person/${person.id}/movie_credits?api_key=${apiKey}&language=fr-FR`;
        const movieCreditsResponse = await fetch(movieCreditsUrl);
        const movieCredits = await movieCreditsResponse.json();

        // Récupération des crédits de série TV
        const tvCreditsUrl = `https://api.themoviedb.org/3/person/${person.id}/tv_credits?api_key=${apiKey}&language=fr-FR`;
        const tvCreditsResponse = await fetch(tvCreditsUrl);
        const tvCredits = await tvCreditsResponse.json();

        // Filtre par rôle (réalisateur pour les films, créateur pour les séries TV)
        if (role === "director" && movieCredits.crew) {
          const directedMovies = movieCredits.crew
            .filter((credit: any) => credit.job === "Director")
            .map((movie: any) => ({
              ...movie,
              media_type: "movie" as const,
              title: movie.title || movie.original_title || "",
              director: person.name,
            }));
          results.push(...directedMovies);
        }

        if (role === "creator" && tvCredits.crew) {
          const createdShows = tvCredits.crew
            .filter((credit: any) => credit.job === "Creator" || credit.job === "Executive Producer")
            .map((show: any) => ({
              ...show,
              media_type: "tv" as const,
              title: show.name || show.original_name || "",
              original_title: show.original_name,
              release_date: show.first_air_date,
              creator: person.name,
            }));
          results.push(...createdShows);
        }
      } catch (error) {
        console.error(`Erreur lors de la récupération des crédits pour ${person.name}:`, error);
        continue;
      }
    }

    // Tri par date de sortie (les plus récents en premier) et limitation des résultats
    return results
      .filter(item => item.release_date) // Seuls les éléments avec une date de sortie
      .sort((a, b) => {
        const dateA = new Date(a.release_date || "").getTime();
        const dateB = new Date(b.release_date || "").getTime();
        return dateB - dateA;
      })
      .slice(0, 15); // Limite à 15 résultats

  } catch (error) {
    console.error("Erreur lors de la recherche par personne:", error);
    return [];
  }
}

async function searchByGenre(
  query: string,
  apiKey: string,
  mediaType: string
): Promise<MediaSuggestion[]> {
  try {
    const results: MediaSuggestion[] = [];

    // Récupération de la liste des genres pour les films et les séries TV
    const movieGenresUrl = `https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=fr-FR`;
    const tvGenresUrl = `https://api.themoviedb.org/3/genre/tv/list?api_key=${apiKey}&language=fr-FR`;

    const [movieGenresResponse, tvGenresResponse] = await Promise.all([
      fetch(movieGenresUrl),
      fetch(tvGenresUrl)
    ]);

    const movieGenres: GenreResponse = await movieGenresResponse.json();
    const tvGenres: GenreResponse = await tvGenresResponse.json();

    // Recherche de genres correspondants (insensible à la casse)
    const queryLower = query.toLowerCase();
    const matchingMovieGenres = movieGenres.genres.filter(genre =>
      genre.name.toLowerCase().includes(queryLower)
    );
    const matchingTvGenres = tvGenres.genres.filter(genre =>
      genre.name.toLowerCase().includes(queryLower)
    );

    // Recherche de films par genre
    if ((mediaType === "all" || mediaType === "movie") && matchingMovieGenres.length > 0) {
      for (const genre of matchingMovieGenres.slice(0, 2)) { // Limite à 2 genres pour éviter trop de requêtes
        const discoverUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${genre.id}&language=fr-FR&sort_by=popularity.desc&page=1`;
        const discoverResponse = await fetch(discoverUrl);
        const discoverData: TMDBResponse = await discoverResponse.json();

        const movies = (discoverData.results as MediaSuggestion[])
          .slice(0, 10) // Limite par genre
          .map(movie => ({
            ...movie,
            media_type: "movie" as const,
            title: movie.title || movie.original_title || "",
            genre_name: genre.name,
          }));
        results.push(...movies);
      }
    }

    // Recherche de séries TV par genre
    if ((mediaType === "all" || mediaType === "tv") && matchingTvGenres.length > 0) {
      for (const genre of matchingTvGenres.slice(0, 2)) { // Limite à 2 genres
        const discoverUrl = `https://api.themoviedb.org/3/discover/tv?api_key=${apiKey}&with_genres=${genre.id}&language=fr-FR&sort_by=popularity.desc&page=1`;
        const discoverResponse = await fetch(discoverUrl);
        const discoverData: TMDBResponse = await discoverResponse.json();

        const tvShows = (discoverData.results as MediaSuggestion[])
          .slice(0, 10) // Limite par genre
          .map(show => ({
            ...show,
            media_type: "tv" as const,
            title: show.name || show.original_name || "",
            original_title: show.original_name,
            release_date: show.first_air_date,
            genre_name: genre.name,
          }));
        results.push(...tvShows);
      }
    }

    // Tri par popularité et limitation des résultats totaux
    return results
      .sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0))
      .slice(0, 20);

  } catch (error) {
    console.error("Erreur lors de la recherche par genre:", error);
    return [];
  }
}
