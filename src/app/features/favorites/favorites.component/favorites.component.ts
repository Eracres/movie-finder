import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FavoritesService } from '../../../core/services/favorites.service';
import { Movie } from '../../../core/models/movie.model';
import { MovieCardComponent } from '../../../shared/components/movie-card/movie-card.component';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterLink, MovieCardComponent],
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.scss'],
})
export class FavoritesComponent implements OnInit {
  favorites: Movie[] = [];

  constructor(
    private favoritesService: FavoritesService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadFavorites();
  }

  loadFavorites(): void {
    this.favorites = this.favoritesService.getFavorites();
    this.cdr.detectChanges();
  }

  toggleFavorite(movie: Movie): void {
    this.favorites = this.favoritesService.toggleFavorite(movie);
    this.cdr.detectChanges();
  }

  isFavorite(movieId: number): boolean {
    return this.favorites.some((movie) => movie.id === movieId);
  }
}