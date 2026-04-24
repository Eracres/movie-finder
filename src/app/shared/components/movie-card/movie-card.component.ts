import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Movie } from '../../../core/models/movie.model';
import { MovieService } from '../../../core/services/movie.service';

@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './movie-card.component.html',
  styleUrls: ['./movie-card.component.scss'],
})
export class MovieCardComponent {
  @Input({ required: true }) movie!: Movie;
  @Input() isFavorite = false;

  @Output() favoriteToggle = new EventEmitter<void>();

  constructor(private movieService: MovieService) {}

  get posterUrl(): string {
    return this.movieService.getPosterUrl(this.movie.poster_path);
  }

  get detailUrl(): string {
    return `/movie/${this.movie.id}`;
  }

  get queryParams(): { type: string } {
    return {
      type: this.movie.media_type,
    };
  }

  onToggleFavorite(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.favoriteToggle.emit();
  }
}