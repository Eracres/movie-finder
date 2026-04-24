import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize, take, timeout } from 'rxjs';
import { MovieService } from '../../../core/services/movie.service';
import { FavoritesService } from '../../../core/services/favorites.service';
import { SearchStateService } from '../../../core/services/search-state.service';
import { Movie, SearchType } from '../../../core/models/movie.model';
import { MovieCardComponent } from '../../../shared/components/movie-card/movie-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, MovieCardComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  query = '';
  searchType: SearchType = 'movie';
  movies: Movie[] = [];
  favorites: Movie[] = [];

  currentPage = 1;
  totalPages = 0;

  isLoading = false;
  errorMessage = '';
  hasSearched = false;

  constructor(
    private movieService: MovieService,
    private favoritesService: FavoritesService,
    private searchStateService: SearchStateService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {
    this.favorites = this.favoritesService.getFavorites();
  }

  ngOnInit(): void {
    const savedState = this.searchStateService.getState();

    if (!savedState) return;

    this.query = savedState.query;
    this.searchType = savedState.searchType;
    this.movies = savedState.movies;
    this.currentPage = savedState.currentPage;
    this.totalPages = savedState.totalPages;
    this.hasSearched = savedState.hasSearched;

    this.cdr.detectChanges();
  }

  setSearchType(type: SearchType): void {
    this.searchType = type;
    this.currentPage = 1;

    if (this.query.trim()) {
      this.onSearch(1);
    }
  }

  onSearch(page: number = 1): void {
    const trimmedQuery = this.query.trim();

    if (!trimmedQuery) {
      this.movies = [];
      this.hasSearched = false;
      this.errorMessage = '';
      this.currentPage = 1;
      this.totalPages = 0;
      this.isLoading = false;
      this.searchStateService.clearState();
      this.cdr.detectChanges();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.hasSearched = true;
    this.currentPage = page;
    this.cdr.detectChanges();

    this.movieService
      .searchMedia(trimmedQuery, this.searchType, page)
      .pipe(
        take(1),
        timeout(10000),
        finalize(() => {
          this.ngZone.run(() => {
            this.isLoading = false;
            this.cdr.detectChanges();
          });
        })
      )
      .subscribe({
        next: (response) => {
          this.ngZone.run(() => {
            this.movies = response.results;
            this.totalPages = response.total_pages;

            this.searchStateService.saveState({
              query: this.query,
              searchType: this.searchType,
              movies: this.movies,
              currentPage: this.currentPage,
              totalPages: this.totalPages,
              hasSearched: this.hasSearched,
            });

            this.cdr.detectChanges();
          });
        },
        error: (error) => {
          this.ngZone.run(() => {
            console.error('Search error:', error);
            this.errorMessage =
              'No se pudieron cargar los resultados. Inténtalo de nuevo.';
            this.movies = [];
            this.cdr.detectChanges();
          });
        },
      });
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages && !this.isLoading) {
      this.onSearch(this.currentPage + 1);
    }
  }

  previousPage(): void {
    if (this.currentPage > 1 && !this.isLoading) {
      this.onSearch(this.currentPage - 1);
    }
  }

  toggleFavorite(movie: Movie): void {
    this.favorites = this.favoritesService.toggleFavorite(movie);
    this.cdr.detectChanges();
  }

  isFavorite(movieId: number): boolean {
    return this.favorites.some((movie) => movie.id === movieId);
  }
}