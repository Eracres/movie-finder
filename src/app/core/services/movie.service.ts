import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MovieSearchResponse, Movie } from '../models/movie.model';

@Injectable({
  providedIn: 'root',
})
export class MovieService {
  private readonly apiUrl = environment.tmdbApiUrl;
  private readonly apiKey = environment.tmdbApiKey;
  private readonly imageBaseUrl = 'https://image.tmdb.org/t/p/w500';

  constructor(private http: HttpClient) {}

  searchMovies(query: string, page: number = 1): Observable<MovieSearchResponse> {
    return this.http.get<MovieSearchResponse>(
      `${this.apiUrl}/search/movie?api_key=${this.apiKey}&query=${encodeURIComponent(query)}&page=${page}`
    );
  }

  getMovieDetails(id: string): Observable<Movie> {
    return this.http.get<Movie>(
      `${this.apiUrl}/movie/${id}?api_key=${this.apiKey}`
    );
  }

  getPosterUrl(path: string | null): string {
    if (!path) {
      return 'https://placehold.co/500x750/111827/E5E7EB?text=Sin+imagen';
    }

    return `${this.imageBaseUrl}${path}`;
  }
}