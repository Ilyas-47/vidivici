import { useState, useEffect } from 'react';
import { Search, ShoppingBag, X, Menu, User } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';

export function Header() {
  const { totalItems, setIsOpen } = useCart();
  const { session } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const scrollToSection = (id: string) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(id);
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    } else {
      const el = document.getElementById(id);
      el?.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-300 ${scrolled
          ? 'bg-white/95 backdrop-blur-sm border-b border-black'
          : 'bg-transparent'
          }`}
      >
        <div className="h-full flex items-center justify-between px-6 lg:px-12">
          {/* Left - Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => navigate('/shop')}
              className="text-xs uppercase tracking-wider hover:opacity-60 transition-opacity"
            >
              Shop
            </button>
            <button
              onClick={() => scrollToSection('ethos')}
              className="text-xs uppercase tracking-wider hover:opacity-60 transition-opacity"
            >
              Explore
            </button>
            <button
              onClick={() => scrollToSection('materiality')}
              className="text-xs uppercase tracking-wider hover:opacity-60 transition-opacity"
            >
              About
            </button>
            <button
              onClick={() => navigate('/track-order')}
              className="text-xs uppercase tracking-wider hover:opacity-60 transition-opacity"
            >
              Track Order
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Center - Logo */}
          <button
            onClick={() => navigate('/')}
            className="absolute left-1/2 -translate-x-1/2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl whitespace-nowrap"
            style={{ fontFamily: 'VidiVici' }}
          >
            VIDI VICI
          </button>

          {/* Right - Actions */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setSearchOpen(true)}
              className="hover:opacity-60 transition-opacity"
            >
              <Search size={18} strokeWidth={1.5} />
            </button>
            <button
              onClick={() => navigate(session ? '/account' : '/auth')}
              className="hover:opacity-60 transition-opacity"
            >
              <User size={18} strokeWidth={1.5} />
            </button>
            <button
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-2 text-xs uppercase tracking-wider hover:opacity-60 transition-opacity"
            >
              <ShoppingBag size={18} strokeWidth={1.5} />
              <span className="hidden sm:inline">[{totalItems}]</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white pt-20 px-6 md:hidden">
          <nav className="flex flex-col gap-6">
            <button
              onClick={() => { navigate('/shop'); setMobileMenuOpen(false); }}
              className="text-2xl text-left uppercase tracking-wider"
            >
              Shop
            </button>
            <button
              onClick={() => scrollToSection('ethos')}
              className="text-2xl text-left uppercase tracking-wider"
            >
              Explore
            </button>
            <button
              onClick={() => scrollToSection('materiality')}
              className="text-2xl text-left uppercase tracking-wider"
            >
              About
            </button>
            <button
              onClick={() => { navigate('/track-order'); setMobileMenuOpen(false); }}
              className="text-2xl text-left uppercase tracking-wider"
            >
              Track Order
            </button>
          </nav>
        </div>
      )}

      {/* Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60] bg-white flex flex-col">
          <div className="flex items-center justify-between px-6 lg:px-12 h-16 border-b border-black">
            <span className="text-xs uppercase tracking-wider">Search</span>
            <button onClick={() => setSearchOpen(false)}>
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSearch} className="flex-1 flex items-center justify-center px-6">
            <input
              autoFocus
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full max-w-xl text-4xl lg:text-6xl border-b-2 border-black pb-4 bg-transparent outline-none placeholder:text-gray-300"
            />
          </form>
        </div>
      )}
    </>
  );
}
