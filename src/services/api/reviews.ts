import { supabase } from '@/lib/supabase';

export const reviewsApi = {
  getAll: async () => {
    // On récupère aussi les infos du produit et de l'utilisateur lié
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        products (name),
        profiles (first_name, last_name)
      `)
      .order('created_at', { ascending: false });
      
      if (error) throw error;
    return data;
  },

  getByProduct: async (productId: string) => {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        profiles (first_name, last_name)
      `)
      .eq('product_id', productId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data;
  },

  updateStatus: async (id: string, status: 'approved' | 'rejected') => {
    const { data, error } = await supabase
      .from('reviews')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
  },
  
  create: async (productId: string, rating: number, comment: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Vous devez être connecté pour laisser un avis');
    
    const { error } = await supabase
      .from('reviews')
      .insert([{
        product_id: productId,
        user_id: session.user.id,
        rating,
        comment,
        status: 'pending' // Les avis doivent être approuvés
      }]);
      
    if (error) throw error;
  }
};
