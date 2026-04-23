import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { FavoriteMovie } from '../models/favorite-movie.model';

@Injectable({
  providedIn: 'root',
})
export class FavoritesService {
  constructor(private supabaseService: SupabaseService) {}

  async getFavorites(): Promise<FavoriteMovie[]> {
    const { data, error } = await this.supabaseService.supabase
      .from('favorites')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data ?? [];
  }

  async addFavorite(movie: FavoriteMovie): Promise<FavoriteMovie> {
    const { data, error } = await this.supabaseService.supabase
      .from('favorites')
      .insert([movie])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async removeFavorite(movieId: number): Promise<void> {
    const { error } = await this.supabaseService.supabase
      .from('favorites')
      .delete()
      .eq('movie_id', movieId);

    if (error) {
      throw error;
    }
  }

  async isFavorite(movieId: number): Promise<boolean> {
    const { data, error } = await this.supabaseService.supabase
      .from('favorites')
      .select('movie_id')
      .eq('movie_id', movieId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return Boolean(data);
  }
}