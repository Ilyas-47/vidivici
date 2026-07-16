import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useCategories } from '@/hooks/queries/useCategories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { toast } from 'sonner';
import { Plus, Trash2, Edit } from 'lucide-react';

export function CategoriesPage() {
  const { categories, isLoading, createCategory, deleteCategory, isCreating, isDeleting } = useCategories();
  const [name, setName] = useState('');
  const { globalSearchTerm } = useOutletContext<{ globalSearchTerm: string }>() || { globalSearchTerm: '' };

  const filteredCategories = categories.filter((c: any) => 
    c.name.toLowerCase().includes(globalSearchTerm.toLowerCase()) ||
    c.slug.toLowerCase().includes(globalSearchTerm.toLowerCase())
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    // Génération 100% automatique et transparente du slug
    const generatedSlug = name.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Supprime les accents
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '');

    try {
      await createCategory({ name, slug: generatedSlug });
      setName('');
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) return;
    
    try {
      await deleteCategory(id);
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Gestion des Catégories</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <form onSubmit={handleCreate} className="space-y-4 bg-card p-4 rounded-lg border">
            <h2 className="font-semibold text-lg">Nouvelle Catégorie</h2>
            <div className="space-y-2">
              <Label htmlFor="name">Nom de la catégorie</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Ex: T-shirts Oversize"
                required 
              />
            </div>
            <Button type="submit" className="w-full" disabled={isCreating}>
              <Plus className="w-4 h-4 mr-2" /> {isCreating ? 'Création...' : 'Ajouter'}
            </Button>
          </form>
        </div>

        <div className="md:col-span-2 bg-card rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                    Chargement...
                  </TableCell>
                </TableRow>
              ) : filteredCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                    Aucune catégorie trouvée.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCategories.map((category: any) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>{category.slug}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="mr-2">
                        <Edit className="w-4 h-4 text-blue-500" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDelete(category.id)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
