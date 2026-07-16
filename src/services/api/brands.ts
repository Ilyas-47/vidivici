import { supabase } from '@/lib/supabase';
import type { Brand } from '@/types';

export const brandsApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Brand[];
  },
  create: async (brand: Omit<Brand, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('brands')
      .insert([brand])
      .select()
      .single();
    if (error) throw error;
    return data as Brand;
  },
  delete: async (id: string) => {
    const { error } = await supabase
      .from('brands')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return id;
  }
};
