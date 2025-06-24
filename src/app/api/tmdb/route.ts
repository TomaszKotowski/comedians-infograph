import { NextResponse } from "next/server";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_API_URL = "https://api.themoviedb.org/3";

export async function POST(request: Request) {
  if (!TMDB_API_KEY) {
    return NextResponse.json(
      { detail: "TMDB_API_KEY environment variable is not set." },
      { status: 500 }
    );
  }

  const { query } = await request.json();

  if (!query) {
    return NextResponse.json(
      { detail: 'Missing "query" in request body.' },
      { status: 400 }
    );
  }

  try {
    // Step 1: Search for the actor
    const searchResponse = await fetch(
      `${TMDB_API_URL}/search/person?query=${encodeURIComponent(
        query
      )}&api_key=${TMDB_API_KEY}`
    );

    if (!searchResponse.ok) {
      const errorData = await searchResponse.json();
      return NextResponse.json(
        { detail: `Error from TMDb: ${errorData.status_message}` },
        { status: searchResponse.status }
      );
    }

    const searchData = await searchResponse.json();

    if (searchData.results.length === 0) {
      return NextResponse.json(
        { detail: "No results found." },
        { status: 404 }
      );
    }

    const actor = searchData.results[0];

    // Step 2: Fetch movie credits for the actor
    const creditsResponse = await fetch(
      `${TMDB_API_URL}/person/${actor.id}/movie_credits?api_key=${TMDB_API_KEY}`
    );

    if (!creditsResponse.ok) {
      const errorData = await creditsResponse.json();
      return NextResponse.json(
        { detail: `Error fetching movie credits: ${errorData.status_message}` },
        { status: creditsResponse.status }
      );
    }

    const creditsData = await creditsResponse.json();

    // Step 3: Combine actor details with their movie credits
    const combinedData = {
      ...actor,
      movies: creditsData.cast,
    };

    return NextResponse.json(combinedData, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { detail: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
