export type SearchType = 'movie' | 'tv' | 'multi';

export type MediaType = 'movie' | 'tv';

export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  media_type: MediaType;
}

export interface MovieSearchResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}