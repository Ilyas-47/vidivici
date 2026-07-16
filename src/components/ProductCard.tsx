import { useRef, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface ProductCardProps {
  product: any;
}

const colorMap: Record<string, string> = {
  'Noir': '#000000',
  'Blanc': '#FFFFFF',
  'Gris': '#808080',
  'Marine': '#000080',
  'Beige': '#F5F5DC',
  'Rouge': '#FF0000'
};

export function ProductCard({ product }: ProductCardProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const primaryRef = useRef<HTMLDivElement>(null);
  const secondaryRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [activeColorImage, setActiveColorImage] = useState<string | null>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const wrapper = wrapperRef.current;
    const primary = primaryRef.current;
    const secondary = secondaryRef.current;
    if (!wrapper || !primary || !secondary) return;

    const rect = wrapper.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const h = rect.height;
    let p = y / h;
    p = Math.max(0, Math.min(1, p));

    secondary.style.opacity = String(p);
    primary.style.transform = `scale(${1 - p * 0.15})`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    const primary = primaryRef.current;
    const secondary = secondaryRef.current;
    if (!primary || !secondary) return;
    secondary.style.opacity = '0';
    primary.style.transform = 'scale(1)';
  }, []);

  return (
    <div
      className="product-card group cursor-pointer"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <h3 className="card-title text-base lg:text-lg tracking-[-0.24px] mb-3 px-4 pt-4 truncate">
        {product.name}
      </h3>

      <div
        ref={wrapperRef}
        className="card-image-wrapper relative w-full aspect-square overflow-hidden bg-[#f3f3f3]"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div
          ref={primaryRef}
          className="card-image-primary absolute inset-0 z-[1] transition-transform duration-100 ease-linear"
        >
          <img
            src={activeColorImage || product.images?.default_primary || product.imagePrimary || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80'}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <div
          ref={secondaryRef}
          className="card-image-secondary absolute inset-0 z-[2] opacity-0 transition-opacity duration-100 ease-linear will-change-[opacity]"
        >
          <img
            src={product.images?.default_hover || product.imageHover || 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=600&q=80'}
            alt={`${product.name} - lifestyle`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      </div>

      <div className="flex items-center justify-between px-4 pb-4 pt-3">
        <div className="flex gap-2 relative z-10" onClick={e => e.stopPropagation()}>
          {product.colors && product.colors.length > 0 && product.colors.map((color: string, i: number) => {
            const hex = colorMap[color] || color;
            return (
              <span
                key={i}
                className="w-4 h-4 rounded-full border border-gray-300 cursor-pointer hover:scale-110 transition-transform"
                style={{ backgroundColor: hex }}
                title={color}
                onMouseEnter={() => {
                  if (product.images?.colors?.[color]) {
                    setActiveColorImage(product.images.colors[color]);
                  }
                }}
                onMouseLeave={() => setActiveColorImage(null)}
                onClick={() => {
                  navigate(`/product/${product.id}?color=${color}`);
                }}
              />
            );
          })}
        </div>
        <span className="text-xs tracking-wider">{Number(product.price).toFixed(2)} MAD</span>
      </div>
    </div>
  );
}
