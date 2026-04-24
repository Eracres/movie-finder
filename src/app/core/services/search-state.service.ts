import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Movie, SearchType } from '../models/movie.model';

type SearchState = {
  query: string;
  searchType: SearchType;
  movies: Movie[];
  currentPage: number;
  totalPages: number;
  hasSearched: boolean;
};

@Injectable({
  providedIn: 'root',
})
export class SearchStateService {
  private readonly storageKey = 'movie-finder-search-state';

  constructor(@Inject(PLATFORM_ID) private platformId: object) {}

  private get canUseStorage(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  saveState(state: SearchState): void {
    if (!this.canUseStorage) return;

    sessionStorage.setItem(this.storageKey, JSON.stringify(state));
  }

  getState(): SearchState | null {
    if (!this.canUseStorage) return null;

    const storedState = sessionStorage.getItem(this.storageKey);

    return storedState ? JSON.parse(storedState) : null;
  }

  clearState(): void {
    if (!this.canUseStorage) return;

    sessionStorage.removeItem(this.storageKey);
  }
}