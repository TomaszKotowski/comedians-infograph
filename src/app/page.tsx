"use client";

import { useState } from "react";
import { Actor, Movie, Prediction } from "../types";
import SearchForm from "../components/SearchForm";
import ActorProfile from "../components/ActorProfile";
import MovieSelector from "../components/MovieSelector";
import PosterDisplay from "../components/PosterDisplay";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function Home() {
  const [actor, setActor] = useState<Actor | null>(null);
  const [selectedMovies, setSelectedMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [generating, setGenerating] = useState(false);
  const [posterStyle, setPosterStyle] = useState("Timeline Flow");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const prompt = formData.get("prompt") as string;

    setLoading(true);
    setError(null);
    setActor(null);
    setSelectedMovies([]);
    setPrediction(null);

    try {
      const response = await fetch(`/api/search?query=${prompt}`);
      const data = await response.json();

      if (response.status !== 200) {
        setError(data.error);
        setLoading(false);
        return;
      }

      setActor(data);
    } catch {
      setError("An error occurred while fetching data.");
    }

    setLoading(false);
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
        posterStyle,
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
    <main className="mx-auto p-4 md:p-8 bg-gray-900 text-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">
          Movie Star Poster Generator
        </h1>

        <SearchForm handleSubmit={handleSubmit} loading={loading} />

        {error && <p className="text-red-500 text-center">{error}</p>}
        {loading && <p className="text-center mt-5">Loading...</p>}

        {actor && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-5">
            <div className="md:col-span-1 bg-gray-800 rounded-lg shadow-lg p-4">
              <ActorProfile actor={actor} />
            </div>
            <div className="md:col-span-1 bg-gray-800 rounded-lg shadow-lg p-4">
              <MovieSelector
                movies={actor.movies}
                selectedMovies={selectedMovies}
                handleMovieSelection={handleMovieSelection}
                posterStyle={posterStyle}
                setPosterStyle={setPosterStyle}
                handleGeneratePoster={handleGeneratePoster}
                generating={generating}
              />
            </div>
            <div className="md:col-span-1 bg-gray-800 rounded-lg shadow-lg p-4 flex items-center justify-center">
              <PosterDisplay prediction={prediction} generating={generating} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
