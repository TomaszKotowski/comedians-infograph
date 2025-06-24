import React from "react";

interface SearchFormProps {
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  loading: boolean;
}

const SearchForm: React.FC<SearchFormProps> = ({ handleSubmit, loading }) => {
  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-8">
      <input
        type="text"
        name="query"
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
  );
};

export default SearchForm;
