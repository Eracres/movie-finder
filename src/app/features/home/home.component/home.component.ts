import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MovieService } from '../../../core/services/movie.service';
import { Movie, SearchType } from '../../../core/models/movie.model';
import { MovieCardComponent } from '../../../shared/components/movie-card/movie-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, MovieCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  query = '';
  searchType: SearchType = 'movie';
  movies: Movie[] = [];
  isLoading = false;
  errorMessage = '';
  hasSearched = false;

  constructor(private movieService: MovieService) {}

  setSearchType(type: SearchType): void {
    this.searchType = type;

    if (this.query.trim()) {
      this.onSearch();
    }
  }

  onSearch(): void {
    const trimmedQuery = this.query.trim();

    if (!trimmedQuery) {
      this.movies = [];
      this.hasSearched = false;
      this.errorMessage = '';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.hasSearched = true;

    this.movieService.searchMedia(trimmedQuery, this.searchType).subscribe({
      next: (response) => {
        this.movies = response.results;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage =
          'No se pudieron cargar los resultados. Inténtalo de nuevo.';
        this.movies = [];
        this.isLoading = false;
      },
    });
  }
}