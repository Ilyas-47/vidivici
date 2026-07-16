import { supabase } from '@/lib/supabase';
import type { Product } from '@/types';

export const productsApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories(name),
        product_colors(color_name, product_images(image_url, is_primary), product_sizes(size, stock))
      `)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return data.map((p: any) => {
      const colors = p.product_colors?.map((c: any) => c.color_name) || [];
      const sizes = Array.from(new Set(p.product_colors?.flatMap((c: any) => c.product_sizes?.map((s: any) => s.size)))) || [];
      
      const stock = p.product_colors?.reduce((acc: number, c: any) => {
        return acc + (c.product_sizes?.reduce((sum: number, s: any) => sum + (s.stock || 0), 0) || 0);
      }, 0) || 0;

      const imagePrimary = p.product_colors?.[0]?.product_images?.find((img: any) => img.is_primary)?.image_url 
                           || p.product_colors?.[0]?.product_images?.[0]?.image_url;
      
      const imageHover = p.product_colors?.[0]?.product_images?.find((img: any) => !img.is_primary)?.image_url;
      
      const imagesObj = {
        default_primary: imagePrimary,
        default_hover: imageHover,
        colors: {} as Record<string, string>
      };
      
      p.product_colors?.forEach((c: any) => {
        const img = c.product_images?.find((i: any) => i.is_primary)?.image_url || c.product_images?.[0]?.image_url;
        if (img) imagesObj.colors[c.color_name] = img;
      });

      return { ...p, colors, sizes, stock, imagePrimary, imageHover, images: imagesObj };
    });
  },
  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories(name),
        product_colors(color_name, product_images(image_url, is_primary), product_sizes(size, stock))
      `)
      .eq('id', id)
      .single();
      
    if (error) throw error;
    
    const colors = data.product_colors?.map((c: any) => c.color_name) || [];
    const sizes = Array.from(new Set(data.product_colors?.flatMap((c: any) => c.product_sizes?.map((s: any) => s.size)))) || [];
    
    const stock = data.product_colors?.reduce((acc: number, c: any) => {
      return acc + (c.product_sizes?.reduce((sum: number, s: any) => sum + (s.stock || 0), 0) || 0);
    }, 0) || 0;

    const imagePrimary = data.product_colors?.[0]?.product_images?.find((img: any) => img.is_primary)?.image_url 
                         || data.product_colors?.[0]?.product_images?.[0]?.image_url;
                         
    const imageHover = data.product_colors?.[0]?.product_images?.find((img: any) => !img.is_primary)?.image_url;

    // Create a color image map for the ProductDetailPage
    const imagesObj = {
      default_primary: imagePrimary,
      default_hover: imageHover,
      colors: {} as Record<string, string>
    };
    
    data.product_colors?.forEach((c: any) => {
      const img = c.product_images?.find((i: any) => i.is_primary)?.image_url || c.product_images?.[0]?.image_url;
      if (img) imagesObj.colors[c.color_name] = img;
    });

    return { ...data, colors, sizes, stock, imagePrimary, imageHover, images: imagesObj };
  },
  create: async (productData: any) => {
    // 1. Generate slug
    const slug = productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 1000);
    
    // 2. Insert main product
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({
        slug,
        name: productData.name,
        short_description: productData.short_description || null,
        description: productData.description || null,
        material: productData.material || null,
        price: productData.price,
        sale_price: productData.sale_price ? productData.sale_price : null,
        category_id: productData.category_id || null,
        collection_id: productData.collection_id || null,
        is_active: true
      })
      .select()
      .single();
      
    if (productError) throw productError;

    // 3. Insert colors & sizes & images
    if (productData.colors && productData.colors.length > 0) {
      for (const colorName of productData.colors) {
        const { data: colorData, error: colorError } = await supabase
          .from('product_colors')
          .insert({
            product_id: product.id,
            color_name: colorName,
          })
          .select()
          .single();
          
        if (colorError || !colorData) continue;

        // Insert sizes for this color
        if (productData.sizes && productData.sizes.length > 0) {
           const sizeInserts = productData.sizes.map((size: string) => ({
             product_color_id: colorData.id,
             size: size,
             stock: productData.stock || 0
           }));
           await supabase.from('product_sizes').insert(sizeInserts);
        }

        // Use provided color specific image, or global primary, or fallback
        const primaryImage = productData.images?.colors?.[colorName] || productData.images?.default_primary || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80';

        await supabase.from('product_images').insert({
          product_color_id: colorData.id,
          image_url: primaryImage,
          is_primary: true
        });

        // Insert hover image if it exists globally
        if (productData.images?.default_hover) {
           await supabase.from('product_images').insert({
             product_color_id: colorData.id,
             image_url: productData.images.default_hover,
             is_primary: false,
             position: 1
           });
        }
      }
    }
    
    return product;
  },
  update: async (id: string, productData: any) => {
    const { data: product, error: productError } = await supabase
      .from('products')
      .update({
        name: productData.name,
        short_description: productData.short_description || null,
        description: productData.description || null,
        material: productData.material || null,
        price: productData.price,
        sale_price: productData.sale_price ? productData.sale_price : null,
        category_id: productData.category_id || null,
        collection_id: productData.collection_id || null,
      })
      .eq('id', id)
      .select()
      .single();
      
    if (productError) throw productError;

    // 2. Handle Colors & Sizes & Images
    const { data: existingColors } = await supabase.from('product_colors').select('*, product_images(*)').eq('product_id', id);
    
    const newColorNames = productData.colors || [];
    
    // Remove unselected colors
    const colorsToRemove = existingColors?.filter((c: any) => !newColorNames.includes(c.color_name)) || [];
    for (const c of colorsToRemove) {
       await supabase.from('product_colors').delete().eq('id', c.id);
    }

    // Process all selected colors
    for (const colorName of newColorNames) {
       let colorId: string;
       const existingColor = existingColors?.find((c: any) => c.color_name === colorName);
       
       if (existingColor) {
         colorId = existingColor.id;
         // Delete old sizes to recreate them with updated stock/selections
         await supabase.from('product_sizes').delete().eq('product_color_id', colorId);
       } else {
         const { data: newColorData } = await supabase.from('product_colors').insert({
           product_id: id, color_name: colorName
         }).select().single();
         colorId = newColorData.id;
       }

       // Insert sizes
       if (productData.sizes && productData.sizes.length > 0) {
         const sizeInserts = productData.sizes.map((size: string) => ({
           product_color_id: colorId,
           size: size,
           stock: productData.stock || 0
         }));
         await supabase.from('product_sizes').insert(sizeInserts);
       }

       // Update Images if provided, or if new color
       const hasSpecificColorImage = productData.images?.colors?.[colorName];
       const hasDefaultPrimaryImage = productData.images?.default_primary;
       
       if (hasSpecificColorImage || hasDefaultPrimaryImage || !existingColor) {
         const primaryImageToUse = hasSpecificColorImage 
           ? productData.images.colors[colorName] 
           : (hasDefaultPrimaryImage ? productData.images.default_primary : 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80');
         
         if (existingColor) {
            await supabase.from('product_images').delete().eq('product_color_id', colorId).eq('is_primary', true);
         }
         
         await supabase.from('product_images').insert({
           product_color_id: colorId,
           image_url: primaryImageToUse,
           is_primary: true
         });
       }

       // Hover image
       const hasHoverImage = productData.images?.default_hover;
       if (hasHoverImage || !existingColor) {
         if (existingColor) {
            await supabase.from('product_images').delete().eq('product_color_id', colorId).eq('is_primary', false);
         }
         
         const hoverImageToUse = hasHoverImage || 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=600&q=80';
         await supabase.from('product_images').insert({
           product_color_id: colorId,
           image_url: hoverImageToUse,
           is_primary: false,
           position: 1
         });
       }
    }
    
    return product;
  },
  toggleActive: async (id: string, current: boolean) => {
    const { error } = await supabase
      .from('products')
      .update({ is_active: !current })
      .eq('id', id);
    if (error) throw error;
    return { id, is_active: !current };
  },
  delete: async (id: string) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return id;
  }
};
