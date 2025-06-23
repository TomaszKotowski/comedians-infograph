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

  const { actor }: { actor: Actor } = await request.json();

  if (!actor) {
    return NextResponse.json(
      { detail: 'Missing "actor" in request body.' },
      { status: 400 }
    );
  }

  // Select the top 5 most recent movies for the prompt
  const notableMovies = actor.movies
    .filter((movie) => movie.release_date)
    .sort(
      (a, b) =>
        new Date(b.release_date).getTime() - new Date(a.release_date).getTime()
    )
    .slice(0, 5)
    .map((movie) => movie.title);

  const prompt = `A cinematic movie poster for the actor ${
    actor.name
  }. The poster should feature a prominent, artistic portrait of ${
    actor.name
  }. The background should be a subtle, abstract collage representing scenes from their iconic movies, including titles like "${notableMovies.join(
    '", "'
  )}". The overall style should be modern, dramatic, and visually stunning.`;

  const options: {
    model: string;
    input: { prompt: string };
    webhook?: string;
    webhook_events_filter?: ("start" | "completed")[];
  } = {
    model: "black-forest-labs/flux-schnell",
    input: { prompt },
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
