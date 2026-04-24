import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Movie } from '../models/movie.model';

@Injectable({
  providedIn: 'root',
})
export class FavoritesService {
  private readonly storageKey = 'movie-finder-favorites';

  constructor(@Inject(PLATFORM_ID) private platformId: object) {}

  private get canUseLocalStorage(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  getFavorites(): Movie[] {
    if (!this.canUseLocalStorage) {
      return [];
    }

    const storedFavorites = localStorage.getItem(this.storageKey);
    return storedFavorites ? JSON.parse(storedFavorites) : [];
  }

  isFavorite(movieId: number): boolean {
    return this.getFavorites().some((movie) => movie.id === movieId);
  }

  toggleFavorite(movie: Movie): Movie[] {
    if (!this.canUseLocalStorage) {
      return [];
    }

    const favorites = this.getFavorites();
    const exists = favorites.some((item) => item.id === movie.id);

    const updatedFavorites = exists
      ? favorites.filter((item) => item.id !== movie.id)
      : [...favorites, movie];

    localStorage.setItem(this.storageKey, JSON.stringify(updatedFavorites));

    return updatedFavorites;
  }
}