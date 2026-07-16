import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { allSizes, allColors } from '@/data/products';
import { useProductFilters } from '@/hooks/useProductFilters';
import { useQuery } from '@tanstack/react-query';
import { useCategories } from '@/hooks/queries/useCategories';
import { useCollections } from '@/hooks/queries/useCollections';
import { productsApi } from '@/services/api/products';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const colorMap: Record<string, string> = {
  'Noir': '#000000',
  'Blanc': '#FFFFFF',
  'Gris': '#808080',
  'Marine': '#000080',
  'Beige': '#F5F5DC',
  'Rouge': '#FF0000'
};

export function ShopPage() {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  
  const { categories } = useCategories();
  const { collections } = useCollections();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: productsApi.getAll
  });

  const activeProducts = products.filter((p: any) => p.is_active !== false);

  const availableSizes = Array.from(new Set(activeProducts.flatMap((p: any) => p.sizes || []))).sort();
  const availableColorNames = Array.from(new Set(activeProducts.flatMap((p: any) => p.colors || []))).sort();

  const {
    filters,
    setCategory,
    toggleCollection,
    toggleSize,
    toggleColor,
    setSearchQuery,
    resetFilters,
    filteredProducts,
  } = useProductFilters(activeProducts);

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [showCount, setShowCount] = useState(8);
  const gridRef = useRef<HTMLDivElement>(null);

  // Apply search from URL
  useEffect(() => {
    if (searchQuery) {
      setSearchQuery(searchQuery);
    }
  }, [searchQuery, setSearchQuery]);

  // Animation
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const cards = grid.querySelectorAll('.product-card');
    gsap.fromTo(
      cards,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        stagger: 0.05,
        duration: 0.4,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: grid,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach(st => {
        if (st.trigger === grid) st.kill();
      });
    };
  }, [filteredProducts]);

  const displayedProducts = filteredProducts.slice(0, showCount);
  const hasMore = showCount < filteredProducts.length;

  const dynamicCategories = [
    { label: 'ALL PRODUCTS', value: 'all' },
    ...categories.map((c: any) => ({ label: c.name.toUpperCase(), value: c.id }))
  ];

  return (
    <main className="pt-16 min-h-screen bg-white">
      {/* Header */}
      <div className="px-6 lg:px-12 py-8 lg:py-12 border-b border-black">
        <h1 className="text-3xl lg:text-5xl font-normal tracking-[-0.96px] mb-6">
          {filters.searchQuery ? `Search: "${filters.searchQuery}"` : 'ALL PRODUCTS'}
        </h1>
        <div className="flex flex-wrap items-center gap-4 lg:gap-8">
          {dynamicCategories.map(cat => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value as any)}
              className={`text-xs uppercase tracking-wider transition-opacity ${
                filters.category === cat.value ? 'opacity-100' : 'opacity-40 hover:opacity-70'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex">
        {/* Sidebar Filters - Desktop */}
        <aside className="hidden lg:block w-[200px] xl:w-[240px] flex-shrink-0 border-r border-black sticky top-16 h-[calc(100vh-64px)] overflow-y-auto">
          <div className="p-6 space-y-8">
            {/* Collections Filter */}
            {collections && collections.length > 0 && (
              <div>
                <h3 className="text-xs uppercase tracking-wider mb-4">Collections</h3>
                <div className="flex flex-col gap-2">
                  {collections.map((col: any) => (
                    <label key={col.id} onClick={() => toggleCollection(col.id)} className="flex items-center gap-2 cursor-pointer group">
                      <div className={`w-4 h-4 border flex items-center justify-center transition-colors ${
                        filters.collections?.includes(col.id)
                          ? 'bg-black border-black text-white'
                          : 'border-gray-300 group-hover:border-black'
                      }`}>
                        {filters.collections?.includes(col.id) && <div className="w-2 h-2 bg-white" />}
                      </div>
                      <span className="text-xs uppercase tracking-wider">{col.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Size Filter */}
            <div>
              <h3 className="text-xs uppercase tracking-wider mb-4">Size</h3>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((size: any) => (
                  <button
                    key={size}
                    onClick={() => toggleSize(size)}
                    className={`w-10 h-10 flex items-center justify-center text-xs border transition-colors ${
                      filters.sizes.includes(size)
                        ? 'bg-black text-white border-black'
                        : 'border-gray-200 hover:border-black'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Filter */}
            <div>
              <h3 className="text-xs uppercase tracking-wider mb-4">Color</h3>
              <div className="flex flex-wrap gap-3">
                {availableColorNames.map((colorName: any) => {
                  const hex = colorMap[colorName] || colorName;
                  return (
                    <button
                      key={colorName}
                      onClick={() => toggleColor(colorName)}
                      className={`w-6 h-6 rounded-full border-2 transition-transform ${
                        filters.colors.includes(colorName)
                          ? 'border-black scale-110'
                          : 'border-transparent hover:scale-110'
                      }`}
                      style={{ backgroundColor: hex, borderColor: colorName === 'Blanc' ? '#e5e7eb' : undefined }}
                      title={colorName}
                    />
                  );
                })}
              </div>
            </div>

            {/* Reset */}
            {(filters.sizes.length > 0 || filters.colors.length > 0 || filters.searchQuery) && (
              <button
                onClick={resetFilters}
                className="text-xs uppercase tracking-wider text-gray-500 hover:text-black transition-colors flex items-center gap-2"
              >
                <X size={12} />
                Reset Filters
              </button>
            )}
          </div>
        </aside>

        {/* Mobile Filter Button */}
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className="lg:hidden fixed bottom-6 right-6 z-40 w-14 h-14 bg-black text-white flex items-center justify-center"
        >
          <SlidersHorizontal size={20} />
        </button>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="flex items-center justify-between px-6 py-4 border-b border-black">
            <span className="text-xs uppercase tracking-wider text-gray-500">
              {filteredProducts.length} Products
            </span>
            <span className="text-xs uppercase tracking-wider text-gray-500 hidden sm:inline">
              Showing {displayedProducts.length} of {filteredProducts.length}
            </span>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 px-6">
              <p className="text-lg text-gray-400 mb-4">Chargement des produits...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-6">
              <p className="text-lg text-gray-400 mb-4">Aucun produit trouvé</p>
              <button
                onClick={resetFilters}
                className="text-xs uppercase tracking-wider underline hover:no-underline"
              >
                Effacer les filtres
              </button>
            </div>
          ) : (
            <>
              <div
                ref={gridRef}
                className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 border-t border-black"
              >
                {displayedProducts.map(product => (
                  <div
                    key={product.id}
                    className="border-r border-b border-black"
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>

              {hasMore && (
                <div className="flex justify-center py-12">
                  <button
                    onClick={() => setShowCount(prev => prev + 8)}
                    className="px-12 py-4 border border-black text-xs uppercase tracking-wider hover:bg-black hover:text-white transition-colors"
                  >
                    Load More
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile Filters Overlay */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-[60] bg-white lg:hidden">
          <div className="flex items-center justify-between px-6 h-16 border-b border-black">
            <span className="text-xs uppercase tracking-wider">Filters</span>
            <button onClick={() => setMobileFiltersOpen(false)}>
              <X size={20} />
            </button>
          </div>
          <div className="p-6 space-y-8 overflow-y-auto h-[calc(100vh-64px)]">
            {/* Size */}
            <div>
              <h3 className="text-xs uppercase tracking-wider mb-4">Size</h3>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((size: any) => (
                  <button
                    key={size}
                    onClick={() => toggleSize(size)}
                    className={`w-12 h-12 flex items-center justify-center text-sm border transition-colors ${
                      filters.sizes.includes(size)
                        ? 'bg-black text-white border-black'
                        : 'border-gray-200'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div>
              <h3 className="text-xs uppercase tracking-wider mb-4">Color</h3>
              <div className="flex flex-wrap gap-3">
                {availableColorNames.map((colorName: any) => {
                  const hex = colorMap[colorName] || colorName;
                  return (
                    <button
                      key={colorName}
                      onClick={() => toggleColor(colorName)}
                      className={`w-8 h-8 rounded-full border-2 ${
                        filters.colors.includes(colorName)
                          ? 'border-black'
                          : 'border-transparent'
                      }`}
                      style={{ backgroundColor: hex, borderColor: colorName === 'Blanc' ? '#e5e7eb' : undefined }}
                      title={colorName}
                    />
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => { resetFilters(); setMobileFiltersOpen(false); }}
              className="w-full py-4 bg-black text-white text-xs uppercase tracking-wider"
            >
              Reset All
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
