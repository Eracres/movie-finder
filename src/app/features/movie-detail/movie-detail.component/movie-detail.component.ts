import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize, take, timeout } from 'rxjs';
import { MovieService } from '../../../core/services/movie.service';
import { FavoritesService } from '../../../core/services/favorites.service';
import { Movie, MediaType } from '../../../core/models/movie.model';

@Component({
  selector: 'app-movie-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './movie-detail.component.html',
  styleUrls: ['./movie-detail.component.scss'],
})
export class MovieDetailComponent implements OnInit {
  movie: Movie | null = null;
  isLoading = true;
  errorMessage = '';
  isFavorite = false;

  constructor(
    private route: ActivatedRoute,
    private movieService: MovieService,
    private favoritesService: FavoritesService,
    private location: Location,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const type = (this.route.snapshot.queryParamMap.get('type') ??
      'movie') as MediaType;

    if (!id) {
      this.errorMessage = 'No se encontró el contenido solicitado.';
      this.isLoading = false;
      this.cdr.detectChanges();
      return;
    }

    this.loadMedia(id, type);
  }

  private loadMedia(id: string, type: MediaType): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.movieService
      .getMediaDetails(id, type)
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
        next: (movie) => {
          this.ngZone.run(() => {
            this.movie = movie;
            this.isFavorite = this.favoritesService.isFavorite(movie.id);
            this.cdr.detectChanges();
          });
        },
        error: (error) => {
          this.ngZone.run(() => {
            console.error('Detail error:', error);
            this.errorMessage = 'No se pudo cargar el detalle.';
            this.movie = null;
            this.cdr.detectChanges();
          });
        },
      });
  }

  get posterUrl(): string {
    return this.movie
      ? this.movieService.getPosterUrl(this.movie.poster_path)
      : '';
  }

  goBack(): void {
    this.location.back();
  }

  toggleFavorite(): void {
    if (!this.movie) return;

    this.favoritesService.toggleFavorite(this.movie);
    this.isFavorite = this.favoritesService.isFavorite(this.movie.id);
    this.cdr.detectChanges();
  }
}
