export interface Movie {
  id: number;
  title: string;
  poster_path: string;
  release_date: string;
}

export interface Actor {
  id: number;
  name: string;
  profile_path: string;
  movies: Movie[];
}

export interface Prediction {
  id: string;
  status: string;
  output?: string[];
  detail?: string;
}
