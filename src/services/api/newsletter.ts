import { supabase } from '@/lib/supabase';

export const newsletterApi = {
  subscribe: async (email: string) => {
    // Vérifier d'abord si l'email existe pour ne pas lever d'erreur moche
    const { data: existing } = await supabase
      .from('newsletter_subscribers')
      .select('email')
      .eq('email', email)
      .single();

    if (existing) {
      throw new Error('Cet email est déjà inscrit à notre newsletter.');
    }

    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert([{ email }]);
      
    if (error) throw error;
    return true;
  },

  getAll: async () => {
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data;
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('newsletter_subscribers')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
  }
};
