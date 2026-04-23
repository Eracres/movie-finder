export interface FavoriteMovie {
  id?: string;
  movie_id: number;
  title: string;
  poster_path: string | null;
  release_date: string | null;
  created_at?: string;
}