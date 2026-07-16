import { useState, useMemo, useCallback } from 'react';
import type { Product, ProductFilters, FilterCategory } from '@/types';

export function useProductFilters(products: Product[]) {
  const [filters, setFilters] = useState<ProductFilters>({
    category: 'all',
    collections: [],
    sizes: [],
    colors: [],
    priceRange: [0, 1000],
    searchQuery: '',
  });

  const setCategory = useCallback((category: FilterCategory) => {
    setFilters(prev => ({ ...prev, category }));
  }, []);

  const toggleSize = useCallback((size: string) => {
    setFilters(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size],
    }));
  }, []);

  const toggleColor = useCallback((color: string) => {
    setFilters(prev => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter(c => c !== color)
        : [...prev.colors, color],
    }));
  }, []);

  const setSearchQuery = useCallback((searchQuery: string) => {
    setFilters(prev => ({ ...prev, searchQuery }));
  }, []);

  const toggleCollection = useCallback((collectionId: string) => {
    setFilters(prev => ({
      ...prev,
      collections: prev.collections?.includes(collectionId)
        ? prev.collections.filter(c => c !== collectionId)
        : [...(prev.collections || []), collectionId],
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      category: 'all',
      collections: [],
      sizes: [],
      colors: [],
      priceRange: [0, 1000],
      searchQuery: '',
    });
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Temporaire: cast `any` pour supporter les fausses données actuelles et les nouvelles
      const product = p as any; 
      
      const productCategory = product.category_id || product.category;
      const productSizes: string[] = Array.isArray(product.sizes) ? product.sizes : (product.colors?.flatMap((c: any) => c.sizes?.map((s: any) => s.size)) || []);
      const productColors: string[] = Array.isArray(product.colors) && typeof product.colors[0] === 'string' 
          ? product.colors 
          : (product.colors?.map((c: any) => c.color_name) || []);

      if (filters.category !== 'all' && productCategory !== filters.category) return false;
      if (filters.collections && filters.collections.length > 0 && (!product.collection_id || !filters.collections.includes(product.collection_id))) return false;
      if (filters.sizes.length > 0 && !productSizes.some((s: string) => filters.sizes.includes(s))) return false;
      if (filters.colors.length > 0 && !productColors.some((c: string) => filters.colors.includes(c))) return false;
      if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) return false;
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        return (
          product.name?.toLowerCase().includes(q) ||
          product.description?.toLowerCase().includes(q) ||
          product.short_description?.toLowerCase().includes(q) ||
          product.material?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [products, filters]);

  return {
    filters,
    setCategory,
    toggleCollection,
    toggleSize,
    toggleColor,
    setSearchQuery,
    resetFilters,
    filteredProducts,
  };
}
