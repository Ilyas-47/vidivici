import { supabase } from '@/lib/supabase';
import type { Category } from '@/types';

export const categoriesApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Category[];
  },
  create: async (category: Omit<Category, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('categories')
      .insert([category])
      .select()
      .single();
    if (error) throw error;
    return data as Category;
  },
  delete: async (id: string) => {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return id;
  }
};
