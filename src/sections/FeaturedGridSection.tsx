import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ProductCard } from '@/components/ProductCard';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '@/services/api/products';

gsap.registerPlugin(ScrollTrigger);

export function FeaturedGridSection() {
  const gridRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { data: allProducts = [] } = useQuery({
    queryKey: ['products'],
    queryFn: productsApi.getAll
  });

  const featuredProducts = allProducts.filter((p: any) => p.is_active !== false).slice(0, 8);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const cards = grid.querySelectorAll('.product-card');

    gsap.fromTo(
      cards,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        stagger: 0.08,
        duration: 0.6,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: grid,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach(st => {
        if (st.trigger === grid) st.kill();
      });
    };
  }, []);

  return (
    <section className="bg-white">
      <div className="flex items-center justify-between px-6 lg:px-12 py-8 border-t border-black">
        <h2 className="text-xs uppercase tracking-wider">Featured Products</h2>
        <button
          onClick={() => navigate('/shop')}
          className="text-xs uppercase tracking-wider hover:opacity-60 transition-opacity"
        >
          View All
        </button>
      </div>

      <div
        ref={gridRef}
        className="grid grid-cols-2 lg:grid-cols-4 border-t border-black"
      >
        {featuredProducts.map(product => (
          <div
            key={product.id}
            className="border-r border-b border-black"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
