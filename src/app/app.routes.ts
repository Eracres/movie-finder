import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home.component/home.component').then(
        (m) => m.HomeComponent
      ),
  },
  {
    path: 'movie/:id',
    loadComponent: () =>
      import(
        './features/movie-detail/movie-detail.component/movie-detail.component'
      ).then((m) => m.MovieDetailComponent),
  },
  {
    path: 'favorites',
    loadComponent: () =>
      import(
        './features/favorites/favorites.component/favorites.component'
      ).then((m) => m.FavoritesComponent),
  },
];
