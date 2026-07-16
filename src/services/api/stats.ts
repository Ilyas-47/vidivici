import { supabase } from '@/lib/supabase';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

export interface DashboardStats {
  totalRevenue: number;
  totalShippingFees: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  salesData: { date: string; amount: number }[];
  recentOrders: any[];
}

export const statsApi = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    // 1. Total des commandes (exact count)
    const { count: totalOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    // 2. Total des produits actifs
    const { count: totalProducts } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // 3. Total des clients
    const { count: totalCustomers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'customer');

    // 4. Revenu total et Chart Data (7 derniers jours)
    // Pour simplifier, on récupère les commandes récentes pour générer le chart
    const sevenDaysAgo = subDays(new Date(), 7).toISOString();
    
    // Récupérer le revenu global et les frais de livraison
    const { data: allOrders } = await supabase
      .from('orders')
      .select('subtotal, total_amount, shipping_fee, created_at')
      .eq('status', 'delivered');

    const totalRevenue = (allOrders || []).reduce((sum, order) => sum + Number(order.subtotal || 0), 0);
    const totalShippingFees = (allOrders || []).reduce((sum, order) => sum + Number(order.shipping_fee || 0), 0);

    // 5. Préparer les données pour le graphique (7 derniers jours)
    const salesData = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const start = startOfDay(date);
      const end = endOfDay(date);
      
      const dayOrders = (allOrders || []).filter(o => {
        const orderDate = new Date(o.created_at);
        return orderDate >= start && orderDate <= end;
      });

      const dayTotal = dayOrders.reduce((sum, o) => sum + Number(o.subtotal || 0), 0);
      
      salesData.push({
        date: format(date, 'dd/MM'),
        amount: dayTotal
      });
    }

    // 6. Commandes récentes (top 5)
    const { data: recentOrders } = await supabase
      .from('orders')
      .select('id, customer_name, total_amount, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    return {
      totalRevenue,
      totalShippingFees,
      totalOrders: totalOrders || 0,
      totalProducts: totalProducts || 0,
      totalCustomers: totalCustomers || 0,
      salesData,
      recentOrders: recentOrders || [],
    };
  }
};
