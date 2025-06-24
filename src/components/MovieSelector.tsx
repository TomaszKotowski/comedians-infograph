import React from 'react';
import { Movie } from '../types';

interface MovieSelectorProps {
  movies: Movie[];
  selectedMovies: Movie[];
  handleMovieSelection: (movie: Movie) => void;
  posterStyle: string;
  setPosterStyle: (style: string) => void;
  handleGeneratePoster: () => void;
  generating: boolean;
}

const MovieSelector: React.FC<MovieSelectorProps> = ({
  movies,
  selectedMovies,
  handleMovieSelection,
  posterStyle,
  setPosterStyle,
  handleGeneratePoster,
  generating,
}) => {
  return (
    <div className="p-4 md:border-r md:border-gray-700">
      <div>
        <h3 className="text-xl font-semibold mb-2">Select up to 5 movies:</h3>
        <div className="max-h-80 md:max-h-full md:h-[calc(100vh-300px)] overflow-y-auto border border-gray-700 rounded-lg p-2">
          <ul className="space-y-2">
            {movies.map((movie) => {
              const isSelected = selectedMovies.some((m) => m.id === movie.id);
              const isDisabled = !isSelected && selectedMovies.length >= 5;

              return (
                <li
                  key={movie.id}
                  className={`flex items-center p-2 rounded-md transition-colors ${
                    isDisabled
                      ? 'opacity-50 cursor-not-allowed'
                      : 'cursor-pointer hover:bg-gray-700'
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

      <div className="mt-4">
        <label className="block text-l font-semibold mb-2">Poster Style</label>
        <select
          value={posterStyle}
          onChange={(e) => setPosterStyle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-700 bg-gray-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option>Timeline Flow</option>
          <option>Mind Map</option>
        </select>
      </div>

      {selectedMovies.length > 0 && (
        <div className="mt-6 text-center">
          <button
            onClick={handleGeneratePoster}
            disabled={generating}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-500 transition-colors"
          >
            {generating
              ? 'Generating...'
              : `Generate Poster for ${selectedMovies.length} movie(s)`}
          </button>
        </div>
      )}
    </div>
  );
};

export default MovieSelector;
