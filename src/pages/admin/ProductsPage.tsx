import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useProducts } from '@/hooks/queries/useProducts';
import { ProductFormModal } from '@/components/admin/ProductFormModal';
import { Button } from '@/components/ui/button';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Product } from '@/types';

export function ProductsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const { products, isLoading, toggleActive, deleteProduct, isDeleting } = useProducts();
  const { globalSearchTerm } = useOutletContext<{ globalSearchTerm: string }>() || { globalSearchTerm: '' };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(globalSearchTerm.toLowerCase()) ||
    p.slug.toLowerCase().includes(globalSearchTerm.toLowerCase()) ||
    (p as any).categories?.name?.toLowerCase().includes(globalSearchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      await deleteProduct(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Gestion des Produits</h1>
        <Button onClick={() => {
          setEditingProduct(null);
          setIsModalOpen(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un Produit
        </Button>
      </div>

      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produit</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Prix</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>En Ligne</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Chargement...
                </TableCell>
              </TableRow>
            ) : filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Aucun produit. Créez votre premier article !
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-xs text-muted-foreground">{product.slug}</div>
                  </TableCell>
                  <TableCell>
                    {(product as any).categories?.name || '-'}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{Number(product.price).toFixed(2)} MAD</div>
                    {product.sale_price && (
                      <div className="text-xs text-red-500 line-through">
                        Promo: {Number(product.sale_price).toFixed(2)} MAD
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className={`font-medium ${product.stock === 0 ? 'text-red-500' : ''}`}>
                      {product.stock || 0}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Switch 
                      checked={!!product.is_active} 
                      onCheckedChange={() => toggleActive({ id: product.id, current: !!product.is_active })}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => {
                        setEditingProduct(product);
                        setIsModalOpen(true);
                      }}>
                        <Edit className="w-4 h-4 text-blue-500" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)} disabled={isDeleting}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ProductFormModal 
        open={isModalOpen} 
        onOpenChange={(val) => {
          setIsModalOpen(val);
          if (!val) setEditingProduct(null);
        }}
        product={editingProduct}
      />
    </div>
  );
}
