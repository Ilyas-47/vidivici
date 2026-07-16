import { supabase } from '@/lib/supabase';

export const ordersApi = {
  create: async (orderData: any, items: any[], paymentData: any) => {
    // 1. Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();
      
    if (orderError) throw orderError;
    
    // 2. Create order items
    const orderItemsToInsert = items.map(item => ({
      order_id: order.id,
      product_id: item.product.id,
      product_name: item.product.name,
      color_name: item.color,
      size_name: item.size,
      quantity: item.quantity,
      unit_price: item.product.sale_price ? Number(item.product.sale_price) : Number(item.product.price),
      total_price: (item.product.sale_price ? Number(item.product.sale_price) : Number(item.product.price)) * item.quantity
    }));
    
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsToInsert);
      
    if (itemsError) throw itemsError;
    
    // 3. Create payment record
    const { error: paymentError } = await supabase
      .from('payments')
      .insert([{
        ...paymentData,
        order_id: order.id
      }]);
      
    if (paymentError) throw paymentError;
    
    // 4. Deduct stock
    for (const item of items) {
      if (!item.product || !item.color || !item.size) continue;
      
      const { data: colors } = await supabase
        .from('product_colors')
        .select('id')
        .eq('product_id', item.product.id)
        .eq('color_name', item.color);
        
      if (colors && colors.length > 0) {
        const colorId = colors[0].id;
        const { data: sizes } = await supabase
          .from('product_sizes')
          .select('id, stock')
          .eq('product_color_id', colorId)
          .eq('size', item.size);
          
        if (sizes && sizes.length > 0) {
          const currentStock = sizes[0].stock || 0;
          await supabase
            .from('product_sizes')
            .update({ stock: Math.max(0, currentStock - item.quantity) })
            .eq('id', sizes[0].id);
        }
      }
      
      // Also update the global product stock
      const { data: productData } = await supabase
        .from('products')
        .select('stock')
        .eq('id', item.product.id)
        .single();
        
      if (productData) {
        const currentGlobalStock = productData.stock || 0;
        await supabase
          .from('products')
          .update({ stock: Math.max(0, currentGlobalStock - item.quantity) })
          .eq('id', item.product.id);
      }
    }
    
    return order;
  },
  trackOrder: async (shortId: string, phone: string) => {
    const { data, error } = await supabase.rpc('track_order', {
      p_short_id: shortId,
      p_phone: phone
    });
    
    if (error) throw error;
    return data;
  },
  getAll: async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  getByCustomer: async (userId: string) => {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  updateStatus: async (id: string, status: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
    return { id, status };
  },
  updateAdminNotes: async (id: string, notes: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ admin_notes: notes, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
    return { id, admin_notes: notes };
  },
  updateOrder: async (id: string, updateData: any) => {
    const { error } = await supabase
      .from('orders')
      .update({ ...updateData, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
    return { id, ...updateData };
  },
  delete: async (id: string) => {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return id;
  }
};
