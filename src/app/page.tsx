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

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function Home() {
  const [actor, setActor] = useState<Actor | null>(null);
  const [selectedMovies, setSelectedMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [generating, setGenerating] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setActor(null);
    setSelectedMovies([]);
    setError(null);
    setPrediction(null);
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
        body: JSON.stringify({ query: prompt }),
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

  const handleMovieSelection = (movie: Movie) => {
    setSelectedMovies((prevSelected) => {
      const isSelected = prevSelected.some((m) => m.id === movie.id);
      if (isSelected) {
        return prevSelected.filter((m) => m.id !== movie.id);
      } else {
        if (prevSelected.length < 5) {
          return [...prevSelected, movie];
        }
        alert("You can only select up to 5 movies.");
        return prevSelected;
      }
    });
  };

  const handleGeneratePoster = async () => {
    if (!actor || selectedMovies.length === 0) return;
    setGenerating(true);
    setError(null);

    const response = await fetch("/api/predictions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        actor: {
          ...actor,
          movies: selectedMovies,
        },
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
    <main className="container mx-auto p-4 md:p-8 bg-gray-900 text-white min-h-screen">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">
          Movie Star Poster Generator
        </h1>

        <form onSubmit={handleSubmit} className="flex gap-2 mb-8">
          <input
            type="text"
            name="prompt"
            placeholder="Enter actor's name..."
            className="flex-grow p-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="p-3 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-500 transition-colors"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </form>

        {error && <p className="text-red-500 text-center">{error}</p>}
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
          <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden mt-5">
            <div className="md:flex">
              <div className="md:w-1/3 p-4 flex flex-col items-center justify-center">
                {actor.profile_path ? (
                  <Image
                    src={`https://image.tmdb.org/t/p/w500${actor.profile_path}`}
                    alt={actor.name}
                    width={200}
                    height={300}
                    className="rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-[200px] h-[300px] bg-gray-700 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400">No Image</span>
                  </div>
                )}
                <h2 className="text-2xl font-bold mt-4 text-center">{actor.name}</h2>
              </div>

              <div className="md:w-2/3 p-4">
                <h3 className="text-xl font-semibold mb-2">Select up to 5 movies:</h3>
                <div className="max-h-80 overflow-y-auto border border-gray-700 rounded-lg p-2">
                  <ul className="space-y-2">
                    {actor.movies.map((movie) => {
                      const isSelected = selectedMovies.some((m) => m.id === movie.id);
                      const isDisabled = !isSelected && selectedMovies.length >= 5;

                      return (
                        <li
                          key={movie.id}
                          className={`flex items-center p-2 rounded-md transition-colors ${
                            isDisabled
                              ? "opacity-50 cursor-not-allowed"
                              : "cursor-pointer hover:bg-gray-700"
                          }`}
                          onClick={() => !isDisabled && handleMovieSelection(movie)}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            disabled={isDisabled}
                            readOnly
                            className="mr-3 h-5 w-5 rounded text-blue-500 bg-gray-600 border-gray-500 focus:ring-blue-500"
                          />
                          <span>
                            {movie.title} ({movie.release_date?.substring(0, 4)})
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
            {selectedMovies.length > 0 && (
              <div className="p-4 text-center">
                <button
                  onClick={handleGeneratePoster}
                  disabled={generating}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-500 transition-colors"
                >
                  {generating
                    ? "Generating..."
                    : `Generate Poster for ${selectedMovies.length} movie(s)`}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

