import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  FolderTree,
  Tag,
  Layers,
  Bell,
  Search,
  Menu,
  Moon,
  Sun,
  Star,
  MessageSquare,
  Truck,
  Mail,
  ClipboardList,
  TrendingDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: ShoppingCart, label: 'Commandes', href: '/admin/orders' },
  { icon: ClipboardList, label: 'Commandes à livrer', href: '/admin/deliveries' },
  { icon: TrendingDown, label: 'Dépenses', href: '/admin/expenses' },
  { icon: Users, label: 'Salaires', href: '/admin/salaries' },
  { icon: Package, label: 'Produits', href: '/admin/products' },
  { icon: FolderTree, label: 'Catégories', href: '/admin/categories' },
  { icon: Tag, label: 'Marques', href: '/admin/brands' },
  { icon: Layers, label: 'Collections', href: '/admin/collections' },
  { icon: Tag, label: 'Codes Promo', href: '/admin/promo-codes', roles: ['admin', 'superadmin'] },
  { icon: Users, label: 'Clients', href: '/admin/customers' },
  { icon: MessageSquare, label: 'Contacts', href: '/admin/contact-messages' },
  { icon: Mail, label: 'Newsletter', href: '/admin/newsletter' },
  { icon: Truck, label: 'Livraisons', href: '/admin/shipping' },
  { icon: Star, label: 'Avis', href: '/admin/reviews' },
  { icon: FolderTree, label: 'Logs Système', href: '/admin/logs' },
  { icon: Settings, label: 'Paramètres', href: '/admin/settings' },
];

export function AdminLayout() {
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.classList.contains('dark'));
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside
        style={{ width: isSidebarOpen ? 260 : 80 }}
        className="bg-card border-r flex flex-col z-20 h-screen sticky top-0 shadow-sm transition-all duration-300"
      >
        <div className="flex h-16 items-center justify-between border-b px-4">
          <Link to="/" className="flex items-center justify-center font-semibold overflow-hidden w-full">
            <span className="text-2xl" style={{ fontFamily: 'VidiVici' }}>VIDI VICI</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="shrink-0">
            <Menu className="h-5 w-5 text-foreground" />
          </Button>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {sidebarItems
            .filter(item => {
              if (item.roles && !item.roles.includes(profile?.role || '')) return false;
              if (profile?.role === 'admin' || profile?.role === 'subadmin') {
                return !['/admin/deliveries', '/admin/expenses', '/admin/salaries', '/admin/logs', '/admin/settings', '/admin/categories', '/admin/brands', '/admin/collections'].includes(item.href);
              }
              return true; // superadmin sees everything
            })
            .map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${isActive
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                >
                  <item.icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                  {isSidebarOpen && (
                    <span className="font-medium whitespace-nowrap text-sm">
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}
        </nav>

        <div className="p-4 border-t">
          <Button
            variant="ghost"
            className={`w-full flex items-center text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all ${isSidebarOpen ? 'justify-start px-3' : 'justify-center px-0'}`}
            onClick={() => signOut()}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {isSidebarOpen && <span className="ml-3 font-medium text-sm">Déconnexion</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-card border-b flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
          <div className="flex-1 flex items-center">
            <div className="relative w-96 max-w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une commande, un produit..."
                value={globalSearchTerm}
                onChange={(e) => setGlobalSearchTerm(e.target.value)}
                className="pl-10 bg-muted/50 border-transparent focus-visible:ring-ring rounded-xl h-10"
              />
            </div>
          </div>
          <div className="flex items-center gap-5">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted" onClick={toggleDarkMode}>
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted relative">
              <MessageSquare className="h-5 w-5 text-foreground" />
            </Button>

            {/* Notifications Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted relative">
                  <Bell className="h-5 w-5 text-foreground" />
                  <span className="absolute top-1.5 right-2 h-2 w-2 bg-destructive rounded-full border-2 border-background"></span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex justify-between items-center">
                  <span>Notifications</span>
                  <Badge variant="destructive">2 Non lues</Badge>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer">
                  <div className="flex items-center justify-between w-full">
                    <span className="font-semibold text-sm">Nouvelle commande #1024</span>
                    <span className="text-xs text-muted-foreground">il y a 5 min</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Jean Dupont vient de passer commande (450 MAD).</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer">
                  <div className="flex items-center justify-between w-full">
                    <span className="font-semibold text-sm text-destructive">Alerte Stock</span>
                    <span className="text-xs text-muted-foreground">il y a 2h</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Le T-shirt "Vintage" (Taille M) est presque épuisé.</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="justify-center text-primary text-sm font-medium cursor-pointer">
                  Voir toutes les notifications
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="h-8 w-[1px] bg-border mx-1"></div>
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="text-right hidden md:block">
                <div className="text-sm font-semibold text-foreground">{profile?.first_name || user?.user_metadata?.first_name || 'Utilisateur'}</div>
                <div className="text-xs text-muted-foreground capitalize">{profile?.role || 'Admin'}</div>
              </div>
              <Avatar className="h-9 w-9 ring-2 ring-gray-100">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-[1600px] mx-auto"
          >
            <Outlet context={{ globalSearchTerm }} />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
