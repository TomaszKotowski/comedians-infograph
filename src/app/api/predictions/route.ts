import { NextResponse } from "next/server";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// In production and preview deployments (on Vercel), the VERCEL_URL environment variable is set.
// In development (on your local machine), the NGROK_HOST environment variable is set.
const WEBHOOK_HOST = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : process.env.NGROK_HOST;

interface Movie {
  id: number;
  title: string;
  release_date: string;
}

interface Actor {
  id: number;
  name: string;
  profile_path: string | null;
  movies: Movie[];
}

export async function POST(request: Request) {
  if (!process.env.REPLICATE_API_TOKEN) {
    throw new Error(
      "The REPLICATE_API_TOKEN environment variable is not set. See README.md for instructions on how to set it."
    );
  }

  const { actor, posterStyle }: { actor: Actor; posterStyle: string } =
    await request.json();

  if (!actor) {
    return NextResponse.json(
      { detail: 'Missing "actor" in request body.' },
      { status: 400 }
    );
  }

  const notableMovies = actor.movies
    .filter(movie => movie.release_date)
    .sort(
      (a, b) =>
        new Date(b.release_date).getTime() - new Date(a.release_date).getTime()
    )
    .slice(0, 5);
  const notableMoviesTitles = notableMovies
    .map(movie => movie.title)
    .join(", ");

  // const genericPrompt = `A cinematic movie poster for the actor ${
  //   actor.name
  // }. The poster should feature a prominent, artistic portrait of ${
  //   actor.name
  // }. The background should be a subtle, abstract collage representing scenes only from their iconic movies like "${notableMovies
  //   .map(movie => movie.title)
  //   .join(
  //     '", "'
  //   )}. The overall style should be modern, dramatic, and visually stunning.
  //   The poster MUST be easy to read and understand.
  //   `;

  //   const genericPrompt = `
  //   Create a vertical movie poster for ${actor.name}.
  //   <rules>
  //   </rules>
  // - **Portrait**: A prominent, eye-catching portrait of ${actor.name} front and center.
  // - **Background**: Subtle silhouettes or abstract hints of their notable films: ${notableMoviesTitles}.
  // - **Style**: Modern, dramatic, and visually stunning. Take into account the style of ${notableMoviesTitles} and most notable scenes from these movies.
  // - **Text**: Title “${actor.name}” in bold, legible type; optional tagline beneath.
  // Ensure a cohesive color palette and layout so the poster reads clearly at a glance.

  // In the poster, show ONLY the ${notableMoviesTitles}. Do NOT show any other movies.
  //   `;

  const genericPrompt = `
Make a vertical (2:3) movie poster in ${posterStyle} style.

• Central portrait: ${actor.name}, clear and prominent.  
• Background: subtle, low‑contrast references to ONLY these films: ${notableMoviesTitles}.  
• Title text: “${actor.name}” in bold, easily readable at the top.  

Example — for guidance only (do not include in output):  
Star: Will Smith | Films: I, Robot — Glass Plaza chase; Independence Day — White House ruins | Style: hyper‑realistic digital painting
`;

  let prompt = "";

  switch (posterStyle) {
    case "Timeline Flow":
      const movieTimeline = notableMovies
        .map(
          movie =>
            `${movie.title} (${new Date(movie.release_date).getFullYear()})`
        )
        .join(" -> ");
      prompt = `A cinematic movie poster for the actor ${actor.name}. The poster should depict a visual timeline of their career, flowing from earliest to most recent of these movies: ${movieTimeline}. For each movie, include a small, artistic representation and a short description of the role. Use a modern, clean color palette with a clear chronological flow.
        In the poster, show ONLY the ${notableMoviesTitles}. Do NOT show any other movies.
      `;
      break;
    case "Mind Map":
      const movieTitles = notableMovies.map(movie => movie.title).join(", ");
      prompt = `A creative movie poster for the actor ${actor.name}. The poster should be a mind map of their career, with their portrait at the center. Branching out from the center, create nodes for each of these movies: ${movieTitles}. Each node should have a visual icon and a brief description of their role. The overall design should be interconnected and visually engaging, using a modern, clean color palette.`;
      break;
    default:
      const defaultMovieTitles = notableMovies
        .map(movie => movie.title)
        .join('", "');
      prompt = `A cinematic movie poster for the actor ${actor.name}. The poster should feature a prominent, artistic portrait of ${actor.name}. The background should be a subtle, abstract collage representing scenes only from their iconic movies like "${defaultMovieTitles}". The overall style should be modern, dramatic, and visually stunning.`;
      break;
  }

  const resultPrompt = `${genericPrompt}\n\n${prompt}`;
  console.log(resultPrompt);

  const options: {
    model: string;
    input: { prompt: string };
    webhook?: string;
    webhook_events_filter?: ("start" | "completed")[];
  } = {
    model: "black-forest-labs/flux-schnell",
    input: { prompt: resultPrompt },
  };

  if (WEBHOOK_HOST) {
    options.webhook = `${WEBHOOK_HOST}/api/webhooks`;
    options.webhook_events_filter = ["start", "completed"];
  }

  // A prediction is the result you get when you run a model, including the input, output, and other details
  const prediction = await replicate.predictions.create(options);

  if (prediction?.error) {
    return NextResponse.json({ detail: prediction.error }, { status: 500 });
  }

  return NextResponse.json(prediction, { status: 201 });
}
