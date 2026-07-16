import { supabase } from '@/lib/supabase';

export type PromoCode = {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  is_active: boolean;
  usage_limit: number | null;
  used_count: number;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
};

export const promoCodesApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as PromoCode[];
  },

  create: async (promoCode: Omit<PromoCode, 'id' | 'created_at' | 'used_count'>) => {
    const { data, error } = await supabase
      .from('promo_codes')
      .insert([promoCode])
      .select()
      .single();

    if (error) throw error;
    return data as PromoCode;
  },

  update: async (id: string, updates: Partial<PromoCode>) => {
    const { data, error } = await supabase
      .from('promo_codes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as PromoCode;
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('promo_codes')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return id;
  },

  validateCode: async (code: string) => {
    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Code promo invalide ou inactif');
      }
      throw error;
    }

    if (data.usage_limit && data.used_count >= data.usage_limit) {
      throw new Error('La limite d\'utilisation de ce code a été atteinte');
    }

    const now = new Date();
    if (data.start_date && new Date(data.start_date) > now) {
      throw new Error('Ce code promo n\'est pas encore valide');
    }
    
    if (data.end_date && new Date(data.end_date) < now) {
      throw new Error('Ce code promo a expiré');
    }

    return data as PromoCode;
  }
};
