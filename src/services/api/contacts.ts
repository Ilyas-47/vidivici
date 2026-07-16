import { supabase } from '@/lib/supabase';

export const contactsApi = {
  create: async (name: string, email: string, message: string) => {
    const { error } = await supabase
      .from('contact_messages')
      .insert([{ name, email, message, status: 'unread' }]);
    if (error) throw error;
  },

  getAll: async () => {
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  updateStatus: async (id: string, status: 'unread' | 'read' | 'replied') => {
    const { error } = await supabase
      .from('contact_messages')
      .update({ status })
      .eq('id', id);
    if (error) throw error;
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('contact_messages')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};
