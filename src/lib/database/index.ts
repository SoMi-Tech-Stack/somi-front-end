/**
 * Database abstraction layer
 * 
 * This module provides a database interface that can be swapped out for different implementations.
 * Currently using Supabase, but structured to allow easy migration to other providers.
 * 
 * @module database
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

/**
 * Database configuration interface
 */
export interface DatabaseConfig {
  url: string;
  apiKey: string;
}

/**
 * Abstract database interface
 * Implement this interface to add support for different database providers
 */
export interface DatabaseProvider {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  query<T>(table: string, query: any): Promise<T[]>;
  insert(table: string, data: any): Promise<any>;
  update(table: string, id: string, data: any): Promise<any>;
  delete(table: string, id: string): Promise<void>;
}

/**
 * Supabase implementation of DatabaseProvider
 */
export class SupabaseProvider implements DatabaseProvider {
  private client;

  constructor(config: DatabaseConfig) {
    this.client = createClient<Database>(config.url, config.apiKey);
  }

  async connect() {
    // Supabase client is initialized in constructor
    // This method exists for interface compatibility
  }

  async disconnect() {
    // Cleanup any active subscriptions
    this.client.removeAllChannels();
  }

  async query<T>(table: string, query: any): Promise<T[]> {
    const { data, error } = await this.client
      .from(table)
      .select(query.select || '*')
      .eq(query.where?.field || '', query.where?.value || '')
      .order(query.orderBy || 'created_at', { ascending: false });

    if (error) throw error;
    return data as T[];
  }

  async insert(table: string, data: any) {
    const { data: result, error } = await this.client
      .from(table)
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  async update(table: string, id: string, data: any) {
    const { data: result, error } = await this.client
      .from(table)
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  async delete(table: string, id: string) {
    const { error } = await this.client
      .from(table)
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}

// Database instance singleton
let dbInstance: DatabaseProvider | null = null;

/**
 * Initialize database connection
 * @param provider Database provider implementation
 */
export async function initializeDatabase(provider: DatabaseProvider) {
  if (dbInstance) {
    throw new Error('Database already initialized');
  }
  await provider.connect();
  dbInstance = provider;
}

/**
 * Get database instance
 * @returns Database provider instance
 */
export function getDatabase(): DatabaseProvider {
  if (!dbInstance) {
    throw new Error('Database not initialized');
  }
  return dbInstance;
}

// Initialize Supabase by default if environment variables are present
if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
  initializeDatabase(new SupabaseProvider({
    url: import.meta.env.VITE_SUPABASE_URL,
    apiKey: import.meta.env.VITE_SUPABASE_ANON_KEY
  })).catch(console.error);
}