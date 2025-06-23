"use client";

import Image from "next/image";
import { useState } from "react";

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

interface Prediction {
  id: string;
  status: string;
  output?: string[];
  detail?: string;
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export default function Home() {
  const [actor, setActor] = useState<Actor | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [generating, setGenerating] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setActor(null);
    setError(null);
    setLoading(true);

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      const prompt = formData.get("prompt") as string;

      const response = await fetch("/api/tmdb", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: prompt,
        }),
      });

      const result = await response.json();

      if (response.status !== 200) {
        setError(result.detail);
        return;
      }

      setActor(result);
    } catch (err) {
      console.error(err);
      setError("An error occurred while fetching data.");
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePoster = async () => {
    if (!actor) return;
    setGenerating(true);
    setError(null);

    const response = await fetch("/api/predictions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        actor,
      }),
    });
    let prediction = await response.json();
    if (response.status !== 201) {
      setError(prediction.detail);
      setGenerating(false);
      return;
    }
    setPrediction(prediction);

    while (
      prediction.status !== "succeeded" &&
      prediction.status !== "failed"
    ) {
      await sleep(1000);
      const response = await fetch("/api/predictions/" + prediction.id);
      prediction = await response.json();
      if (response.status !== 200) {
        setError(prediction.detail);
        setGenerating(false);
        return;
      }
      setPrediction(prediction);
    }
    setGenerating(false);
  };

  return (
    <div className="container max-w-2xl mx-auto p-5">
      <h1 className="py-6 text-center font-bold text-2xl">
        Movie Star Poster Generator
      </h1>

      <form className="w-full flex" onSubmit={handleSubmit}>
        <input
          className="flex-grow"
          name="prompt"
          placeholder="Enter a movie star's name to generate a poster"
        />
        <button className="button" type="submit" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {error && <div className="mt-5 text-red-500">{error}</div>}

      {loading && <p className="text-center mt-5">Loading...</p>}

      {prediction && (
        <div className="mt-5">
          {prediction.output && (
            <div className="image-wrapper mt-5">
              <Image
                src={prediction.output[prediction.output.length - 1]}
                alt="output"
                sizes="100vw"
                width={768}
                height={768}
              />
            </div>
          )}
          <p className="py-3 text-sm opacity-50">status: {prediction.status}</p>
        </div>
      )}

      {actor && !prediction && (
        <div className="mt-5 p-4 border rounded-md bg-gray-50">
          <h2 className="text-2xl font-bold mb-2">{actor.name}</h2>
          {actor.profile_path ? (
            <Image
              src={`https://image.tmdb.org/t/p/w500${actor.profile_path}`}
              alt={`Profile of ${actor.name}`}
              width={500}
              height={750}
              className="rounded-md w-full max-w-xs mx-auto"
            />
          ) : (
            <p>No image available.</p>
          )}

          <div className="mt-5">
            <h3 className="text-xl font-bold mb-2">Movie Timeline</h3>
            <ul className="list-disc list-inside">
              {actor.movies
                .filter(movie => movie.release_date)
                .sort(
                  (a, b) =>
                    new Date(b.release_date).getTime() -
                    new Date(a.release_date).getTime()
                )
                .map(movie => (
                  <li key={movie.id}>
                    {movie.title} ({new Date(movie.release_date).getFullYear()})
                  </li>
                ))}
            </ul>
          </div>

          <div className="mt-5 text-center">
            <button
              onClick={handleGeneratePoster}
              className="button"
              disabled={generating}
            >
              {generating ? "Generating..." : "Generate Poster"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
