import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Star } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { productsApi } from '@/services/api/products';
import { reviewsApi } from '@/services/api/reviews';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { ProductCard } from '@/components/ProductCard';
import gsap from 'gsap';

const colorMap: Record<string, string> = {
  'Noir': '#000000',
  'Blanc': '#FFFFFF',
  'Gris': '#808080',
  'Marine': '#000080',
  'Beige': '#F5F5DC',
  'Rouge': '#FF0000'
};

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { session } = useAuth();
  
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.getById(id!),
    enabled: !!id
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => reviewsApi.getByProduct(id!),
    enabled: !!id
  });

  const submitReview = useMutation({
    mutationFn: () => reviewsApi.create(id!, rating, comment),
    onSuccess: () => {
      toast.success('Votre avis a été soumis et est en attente d\'approbation !');
      setRating(5);
      setComment('');
    },
    onError: (error: any) => toast.error(error.message || 'Erreur lors de l\'envoi')
  });

  // Mock related products for now since we need a separate query for it
  const { data: allProducts = [] } = useQuery({
    queryKey: ['products'],
    queryFn: productsApi.getAll
  });

  const relatedProducts = allProducts.filter((p: any) => p.id !== id && p.category_id === product?.category_id).slice(0, 4);

  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [added, setAdded] = useState(false);
  const [hoverImage, setHoverImage] = useState(false);

  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (product) {
      if (product.sizes && product.sizes.length > 0) {
        setSelectedSize(product.sizes[0]);
      }
      if (product.colors && product.colors.length > 0) {
        setSelectedColor(product.colors[0]);
      }
      window.scrollTo(0, 0);
    }
  }, [product]);

  useEffect(() => {
    if (imageRef.current) {
      gsap.fromTo(
        imageRef.current,
        { opacity: 0, scale: 1.05 },
        { opacity: 1, scale: 1, duration: 0.6, ease: 'power2.out' }
      );
    }
  }, [id]);

  if (isLoading) {
    return (
      <main className="pt-32 px-6 text-center">
        <p className="text-lg text-gray-400 mb-4">Chargement du produit...</p>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="pt-32 px-6 text-center">
        <p className="text-lg text-gray-400 mb-4">Produit introuvable</p>
        <button
          onClick={() => navigate('/shop')}
          className="text-xs uppercase tracking-wider underline"
        >
          Retour à la boutique
        </button>
      </main>
    );
  }

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) return;
    addItem(product as any, selectedSize, selectedColor);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  // Determine current image
  let currentImage = hoverImage
    ? (product.images?.default_hover || product.imageHover)
    : (product.images?.default_primary || product.imagePrimary);

  // If a color is selected, override with color specific image if it exists
  if (selectedColor && product.images?.colors?.[selectedColor] && !hoverImage) {
    // Only replacing the primary image with the color image for MVP
    // If we have a specific hover image for this color, we could use it too
    // For now, let's assume color images are primary faces
    // We could extract the URL if it's a file object, but let's assume it's a string URL from Supabase for now
    const colorImage = product.images.colors[selectedColor];
    if (typeof colorImage === 'string') {
      currentImage = colorImage;
    }
  }

  const fallbackImage = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80';
  const finalImageSrc = currentImage || fallbackImage;

  const averageRating = reviews.length > 0
    ? reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviews.length
    : 0;

  const renderStars = (ratingValue: number) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className={`w-4 h-4 ${i < Math.round(ratingValue) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
        ))}
      </div>
    );
  };

  return (
    <main className="pt-16 min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="px-6 lg:px-12 py-6 border-b border-black">
        <button
          onClick={() => navigate('/shop')}
          className="flex items-center gap-2 text-xs uppercase tracking-wider text-gray-500 hover:text-black transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Shop
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Image */}
        <div
          ref={imageRef}
          className="relative aspect-square lg:aspect-auto lg:h-screen bg-[#f3f3f3] overflow-hidden cursor-crosshair"
          onMouseEnter={() => setHoverImage(true)}
          onMouseLeave={() => setHoverImage(false)}
        >
          <img
            src={finalImageSrc}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500"
          />
        </div>

        {/* Info */}
        <div className="px-6 lg:px-12 py-8 lg:py-16 flex flex-col">
          <div className="flex-1">
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">
              {product.category}
            </p>
            <h1 className="text-3xl lg:text-4xl font-normal tracking-[-0.96px] mb-4">
              {product.name}
            </h1>

            {/* Rating Summary */}
            <div className="flex items-center gap-2 mb-6 cursor-pointer" onClick={() => document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' })}>
              {renderStars(averageRating)}
              <span className="text-xs text-gray-500 underline">({reviews.length} avis)</span>
            </div>

            {product.sale_price ? (
              <div className="flex items-center gap-3 mb-8">
                <p className="text-lg font-medium text-red-600">{Number(product.sale_price).toFixed(2)} MAD</p>
                <p className="text-base text-gray-400 line-through">{Number(product.price).toFixed(2)} MAD</p>
              </div>
            ) : (
              <p className="text-lg mb-8">{Number(product.price).toFixed(2)} MAD</p>
            )}

            <p className="text-sm leading-relaxed text-[#666666] mb-8">
              {product.description}
            </p>

            <div className="mb-4">
              <p className="text-xs uppercase tracking-wider mb-2 text-gray-500">Matière</p>
              <p className="text-sm">{product.material || '100% Coton bio'}</p>
            </div>

            {/* Color Selection */}
            <div className="mb-6">
              <p className="text-xs uppercase tracking-wider mb-3 text-gray-500">
                Couleur {selectedColor && (
                  <span
                    className="inline-block w-3 h-3 rounded-full ml-2 align-middle border border-gray-300"
                    style={{ backgroundColor: colorMap[selectedColor] || selectedColor }}
                    title={selectedColor}
                  />
                )}
              </p>
              <div className="flex gap-3">
                {product.colors?.map((color: string) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-full border-2 transition-transform ${selectedColor === color ? 'border-black scale-110' : 'border-gray-200 hover:scale-105'
                      }`}
                    style={{ backgroundColor: colorMap[color] || color }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div className="mb-8">
              <p className="text-xs uppercase tracking-wider mb-3 text-gray-500">Size</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes?.map((size: string) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[48px] h-12 px-4 flex items-center justify-center text-sm border transition-colors ${selectedSize === size
                        ? 'bg-black text-white border-black'
                        : 'border-gray-200 hover:border-black'
                      }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            disabled={added}
            className={`w-full py-4 text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${added
                ? 'bg-green-600 text-white'
                : 'bg-black text-white hover:bg-gray-800'
              }`}
          >
            {added ? (
              <>
                <Check size={14} />
                Added to Cart
              </>
            ) : (
              `Add to Cart — ${product.sale_price ? Number(product.sale_price).toFixed(2) : Number(product.price).toFixed(2)} MAD`
            )}
          </button>
        </div>
      </div>

      {/* Reviews Section */}
      <div id="reviews-section" className="border-t border-black px-6 lg:px-12 py-16">
        <h2 className="text-2xl font-normal tracking-[-0.96px] mb-12">Avis Clients</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Liste des avis */}
          <div>
            {reviews.length === 0 ? (
              <p className="text-gray-500 text-sm">Il n'y a pas encore d'avis pour ce produit. Soyez le premier à donner votre avis !</p>
            ) : (
              <div className="space-y-8">
                {reviews.map((review: any) => (
                  <div key={review.id} className="border-b border-gray-100 pb-8 last:border-0">
                    <div className="flex items-center gap-2 mb-2">
                      {renderStars(review.rating)}
                      <span className="text-sm font-medium ml-2">
                        {review.profiles ? `${review.profiles.first_name || ''} ${review.profiles.last_name || ''}`.trim() || 'Client' : 'Client mystère'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mb-3">{new Date(review.created_at).toLocaleDateString('fr-FR')}</p>
                    <p className="text-sm leading-relaxed">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Formulaire d'avis */}
          <div className="bg-[#f9f9f9] p-8 lg:p-12">
            <h3 className="text-lg mb-6 uppercase tracking-wider text-sm">Laisser un avis</h3>

            {session ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-500 mb-3">Votre note</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className="focus:outline-none transition-transform hover:scale-110"
                      >
                        <Star className={`w-6 h-6 ${rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-500 mb-3">Votre commentaire</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    className="w-full border border-gray-300 p-4 focus:border-black focus:outline-none resize-none bg-transparent"
                    placeholder="Qu'avez-vous pensé de cet article ?"
                  />
                </div>

                <button
                  onClick={() => submitReview.mutate()}
                  disabled={submitReview.isPending || !comment.trim()}
                  className="w-full py-4 bg-black text-white text-xs uppercase tracking-wider hover:bg-gray-800 disabled:opacity-50 transition-colors"
                >
                  {submitReview.isPending ? 'Envoi...' : 'Envoyer mon avis'}
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500 mb-6">Vous devez être connecté pour partager votre expérience avec les autres clients.</p>
                <button
                  onClick={() => navigate('/auth')}
                  className="px-8 py-3 border border-black text-xs uppercase tracking-wider hover:bg-black hover:text-white transition-colors"
                >
                  Se connecter / S'inscrire
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="border-t border-black px-6 lg:px-12 py-12">
          <h2 className="text-xs uppercase tracking-wider mb-8">Related Products</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 border-t border-black">
            {relatedProducts.map(p => (
              <div key={p.id} className="border-r border-b border-black">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
