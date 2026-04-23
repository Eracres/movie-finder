import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MovieService } from '../../../core/services/movie.service';
import { Movie } from '../../../core/models/movie.model';
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
  movies: Movie[] = [];
  isLoading = false;
  errorMessage = '';
  hasSearched = false;

  constructor(private movieService: MovieService) {}

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

    this.movieService.searchMovies(trimmedQuery).subscribe({
      next: (response) => {
        this.movies = response.results;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage =
          'No se pudieron cargar las películas. Inténtalo de nuevo.';
        this.movies = [];
        this.isLoading = false;
      },
    });
  }
}