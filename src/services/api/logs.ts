import { supabase } from '@/lib/supabase';

export const logsApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('system_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
      
    if (error) throw error;
    return data;
  },

  create: async (log: { action: string, target: string, type: string }) => {
    // On peut aussi créer des logs manuellement depuis le front si on veut
    // L'email sera géré par la base de données ou on peut l'envoyer
    const { data: { session } } = await supabase.auth.getSession();
    const userEmail = session?.user?.email || 'Système/Invité';

    const { error } = await supabase
      .from('system_logs')
      .insert([{
        user_email: userEmail,
        action: log.action,
        target: log.target,
        type: log.type
      }]);
      
    if (error) throw error;
  }
};
