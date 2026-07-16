import { supabase } from '@/lib/supabase';

export interface CustomerProfile {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: string;
  created_at: string;
}

export const customersApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as CustomerProfile[];
  },
  update: async (id: string, updates: Partial<CustomerProfile>) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};
