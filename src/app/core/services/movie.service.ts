import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map, Observable } from 'rxjs';
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
    if (searchType === 'multi') {
      return this.searchMoviesAndSeries(query, page);
    }

    const endpoint = searchType === 'movie' ? 'search/movie' : 'search/tv';

    return this.http
      .get<TmdbRawResponse>(
        `${this.apiUrl}/${endpoint}?api_key=${this.apiKey}&query=${encodeURIComponent(
          query
        )}&page=${page}&language=es-ES`
      )
      .pipe(
        map((response) => ({
          page: response.page,
          total_pages: response.total_pages,
          total_results: response.total_results,
          results: response.results.map((item) =>
            this.normalizeResult(item, searchType)
          ),
        }))
      );
  }

  searchMovies(query: string, page: number = 1): Observable<MovieSearchResponse> {
    return this.searchMedia(query, 'movie', page);
  }

  getMovieDetails(id: string): Observable<Movie> {
    return this.getMediaDetails(id, 'movie');
  }

  getMediaDetails(id: string, type: MediaType): Observable<Movie> {
    const endpoint = type === 'tv' ? 'tv' : 'movie';

    return this.http
      .get<TmdbRawResult>(
        `${this.apiUrl}/${endpoint}/${id}?api_key=${this.apiKey}&language=es-ES`
      )
      .pipe(map((item) => this.normalizeResult(item, type)));
  }

  getPosterUrl(path: string | null): string {
    if (!path) {
      return 'https://placehold.co/500x750/111827/E5E7EB?text=Sin+imagen';
    }

    return `${this.imageBaseUrl}${path}`;
  }

  private searchMoviesAndSeries(
    query: string,
    page: number
  ): Observable<MovieSearchResponse> {
    const movieRequest = this.http.get<TmdbRawResponse>(
      `${this.apiUrl}/search/movie?api_key=${this.apiKey}&query=${encodeURIComponent(
        query
      )}&page=${page}&language=es-ES`
    );

    const tvRequest = this.http.get<TmdbRawResponse>(
      `${this.apiUrl}/search/tv?api_key=${this.apiKey}&query=${encodeURIComponent(
        query
      )}&page=${page}&language=es-ES`
    );

    return forkJoin({
      movies: movieRequest,
      series: tvRequest,
    }).pipe(
      map(({ movies, series }) => {
        const movieResults = movies.results.map((item) =>
          this.normalizeResult(item, 'movie')
        );

        const seriesResults = series.results.map((item) =>
          this.normalizeResult(item, 'tv')
        );

        const combinedResults = [...movieResults, ...seriesResults].sort(
          (a, b) => b.vote_average - a.vote_average
        );

        return {
          page,
          results: combinedResults,
          total_pages: Math.max(movies.total_pages, series.total_pages),
          total_results: movies.total_results + series.total_results,
        };
      })
    );
  }

  private normalizeResult(item: TmdbRawResult, mediaType: MediaType): Movie {
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