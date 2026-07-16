import { supabase } from '@/lib/supabase';
import type { Collection } from '@/types';

export const collectionsApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Collection[];
  },
  create: async (collection: Omit<Collection, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('collections')
      .insert([collection])
      .select()
      .single();
    if (error) throw error;
    return data as Collection;
  },
  delete: async (id: string) => {
    const { error } = await supabase
      .from('collections')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return id;
  },
  update: async (id: string, collection: Partial<Collection>) => {
    const { data, error } = await supabase
      .from('collections')
      .update(collection)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Collection;
  }
};
