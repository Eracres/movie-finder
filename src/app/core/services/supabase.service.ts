import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private client: SupabaseClient | null = null;
  private platformId = inject(PLATFORM_ID);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.client = createClient(
        environment.supabaseUrl,
        environment.supabaseKey
      );
    }
  }

  get supabase(): SupabaseClient {
    if (!this.client) {
      throw new Error('Supabase solo disponible en el navegador');
    }
    return this.client;
  }
}