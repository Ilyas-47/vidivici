import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { newsletterApi } from '@/services/api/newsletter';
import { categoriesApi } from '@/services/api/categories';
import { toast } from 'sonner';

export function Footer() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || isLoading) return;

    setIsLoading(true);
    try {
      await newsletterApi.subscribe(email.trim());
      setEmail('');
      toast.success('Merci de votre inscription à notre newsletter !');
    } catch (error: any) {
      toast.error(error.message || 'Une erreur est survenue.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <footer className="bg-black text-white">
      {/* Newsletter Section */}
      <div className="px-6 lg:px-12 py-20 lg:py-32">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl lg:text-6xl xl:text-[84px] font-normal tracking-[-2.52px] leading-none mb-8">
            JOIN THE ATELIER
          </h2>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 bg-transparent border-b border-white/30 pb-3 text-sm outline-none placeholder:text-white/40 focus:border-white transition-colors"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-8 py-3 bg-white text-black text-xs uppercase tracking-wider hover:bg-white/90 transition-colors disabled:opacity-50"
            >
              {isLoading ? '...' : 'Subscribe'}
            </button>
          </form>
        </div>
      </div>

      {/* Footer Grid */}
      <div className="border-t border-white/10 px-6 lg:px-12 py-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <div>
            <h4 className="text-xs uppercase tracking-wider mb-4 text-white/50">Shop</h4>
            <ul className="space-y-2">
              {categories.slice(0, 5).map((category: any) => (
                <li key={category.id}>
                  <span
                    onClick={() => {
                      navigate(`/shop?category=${category.slug}`);
                      window.scrollTo(0, 0);
                    }}
                    className="text-xs uppercase tracking-wider text-white/70 hover:text-white transition-colors cursor-pointer"
                  >
                    {category.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-wider mb-4 text-white/50">Support</h4>
            <ul className="space-y-2">
              {[
                { name: 'Shipping', path: '/shipping' },
                { name: 'Returns', path: '/returns' },
                { name: 'Track Order', path: '/track-order' },
                { name: 'Contact', path: '/contact' }
              ].map(item => (
                <li key={item.name}>
                  <span
                    onClick={() => {
                      navigate(item.path);
                      window.scrollTo(0, 0);
                    }}
                    className="text-xs uppercase tracking-wider text-white/70 hover:text-white transition-colors cursor-pointer"
                  >
                    {item.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-wider mb-4 text-white/50">Social</h4>
            <ul className="space-y-2">
              {[
                { name: 'Instagram', url: 'https://instagram.com/summershop' },
                { name: 'TikTok', url: 'https://tiktok.com/@summershop' },
                { name: 'Pinterest', url: 'https://pinterest.com' }
              ].map(item => (
                <li key={item.name}>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs uppercase tracking-wider text-white/70 hover:text-white transition-colors cursor-pointer"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-wider mb-4 text-white/50">Legal</h4>
            <ul className="space-y-2">
              {[
                { name: 'Privacy', path: '/privacy' },
                { name: 'Terms', path: '/terms' }
              ].map(item => (
                <li key={item.name}>
                  <span
                    onClick={() => {
                      navigate(item.path);
                      window.scrollTo(0, 0);
                    }}
                    className="text-xs uppercase tracking-wider text-white/70 hover:text-white transition-colors cursor-pointer"
                  >
                    {item.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 px-6 lg:px-12 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="text-xs uppercase tracking-wider text-white/40">
          &copy; 2026 Vidi Vici. All rights reserved.
        </span>
        <span className="text-xs uppercase tracking-wider text-white/40">
          Engineered for Motion
        </span>
      </div>
    </footer>
  );
}
