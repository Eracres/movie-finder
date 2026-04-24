import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  MovieSearchResponse,
  Movie,
  SearchType,
  MediaType,
} from '../models/movie.model';

type TmdbRawResult = {
  id: number;
  title?: string;
  name?: string;
  overview?: string;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  media_type?: MediaType | 'person';
};

type TmdbRawResponse = {
  page: number;
  results: TmdbRawResult[];
  total_pages: number;
  total_results: number;
};

@Injectable({
  providedIn: 'root',
})
export class MovieService {
  private readonly apiUrl = environment.tmdbApiUrl;
  private readonly apiKey = environment.tmdbApiKey;
  private readonly imageBaseUrl = 'https://image.tmdb.org/t/p/w500';

  constructor(private http: HttpClient) {}

  searchMedia(
    query: string,
    searchType: SearchType = 'movie',
    page: number = 1
  ): Observable<MovieSearchResponse> {
    const endpoint =
      searchType === 'movie'
        ? 'search/movie'
        : searchType === 'tv'
        ? 'search/tv'
        : 'search/multi';

    return this.http
      .get<TmdbRawResponse>(
        `${this.apiUrl}/${endpoint}?api_key=${this.apiKey}&query=${encodeURIComponent(
          query
        )}&page=${page}&language=es-ES`
      )
      .pipe(
        map((response) => ({
          ...response,
          results: response.results
            .filter((item) => {
              if (searchType === 'multi') {
                return item.media_type === 'movie' || item.media_type === 'tv';
              }

              return true;
            })
            .map((item) => this.normalizeResult(item, searchType)),
        }))
      );
  }

  searchMovies(query: string, page: number = 1): Observable<MovieSearchResponse> {
    return this.searchMedia(query, 'movie', page);
  }

  getMovieDetails(id: string): Observable<Movie> {
    return this.http.get<Movie>(
      `${this.apiUrl}/movie/${id}?api_key=${this.apiKey}&language=es-ES`
    );
  }

  getPosterUrl(path: string | null): string {
    if (!path) {
      return 'https://placehold.co/500x750/111827/E5E7EB?text=Sin+imagen';
    }

    return `${this.imageBaseUrl}${path}`;
  }

  private normalizeResult(
    item: TmdbRawResult,
    searchType: SearchType
  ): Movie {
    const mediaType: MediaType =
      searchType === 'movie'
        ? 'movie'
        : searchType === 'tv'
        ? 'tv'
        : item.media_type === 'tv'
        ? 'tv'
        : 'movie';

    return {
      id: item.id,
      title: item.title ?? item.name ?? 'Sin título',
      overview: item.overview ?? 'Sin descripción disponible.',
      poster_path: item.poster_path ?? null,
      release_date: item.release_date ?? item.first_air_date ?? '',
      vote_average: item.vote_average ?? 0,
      media_type: mediaType,
    };
  }
}