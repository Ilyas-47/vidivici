import { supabase } from '@/lib/supabase';

export const shippingZonesApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('shipping_zones')
      .select('*')
      .order('city_name', { ascending: true });
    if (error) throw error;
    return data;
  },
  
  getActive: async () => {
    const { data, error } = await supabase
      .from('shipping_zones')
      .select('*')
      .eq('is_active', true)
      .order('city_name', { ascending: true });
    if (error) throw error;
    return data;
  },

  create: async (zoneData: any) => {
    const { data, error } = await supabase
      .from('shipping_zones')
      .insert([zoneData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  update: async (id: string, zoneData: any) => {
    const { data, error } = await supabase
      .from('shipping_zones')
      .update(zoneData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('shipping_zones')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }
};
