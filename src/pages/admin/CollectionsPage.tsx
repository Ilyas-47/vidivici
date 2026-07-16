import { useState } from 'react';
import { useCollections } from '@/hooks/queries/useCollections';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { toast } from 'sonner';
import { Plus, Trash2, Edit } from 'lucide-react';

export function CollectionsPage() {
  const { collections, isLoading, createCollection, updateCollection, deleteCollection, isCreating, isUpdating, isDeleting } = useCollections();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const generatedSlug = name.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '');

    try {
      if (editingId) {
        await updateCollection({ id: editingId, data: { name, slug: generatedSlug, description } });
        setEditingId(null);
      } else {
        await createCollection({ name, slug: generatedSlug, description });
      }
      setName('');
      setDescription('');
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      }
    }
  };

  const startEdit = (collection: any) => {
    setEditingId(collection.id);
    setName(collection.name);
    setDescription(collection.description || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setName('');
    setDescription('');
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette collection ?')) return;
    
    try {
      await deleteCollection(id);
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Gestion des Collections</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <form onSubmit={handleCreate} className="space-y-4 bg-card p-4 rounded-lg border">
            <h2 className="font-semibold text-lg">{editingId ? 'Modifier Collection' : 'Nouvelle Collection'}</h2>
            <div className="space-y-2">
              <Label htmlFor="name">Nom de la collection</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Ex: Collection Été 2026"
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optionnel)</Label>
              <Textarea 
                id="description" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={isCreating || isUpdating}>
                {editingId ? (
                  isUpdating ? 'Modification...' : 'Modifier'
                ) : (
                  <><Plus className="w-4 h-4 mr-2" /> {isCreating ? 'Création...' : 'Ajouter'}</>
                )}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={cancelEdit}>
                  Annuler
                </Button>
              )}
            </div>
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
              ) : collections.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                    Aucune collection. Créez-en une !
                  </TableCell>
                </TableRow>
              ) : (
                collections.map((collection) => (
                  <TableRow key={collection.id}>
                    <TableCell className="font-medium">{collection.name}</TableCell>
                    <TableCell>{collection.slug}</TableCell>
                    <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="mr-2" onClick={() => startEdit(collection)}>
                      <Edit className="w-4 h-4 text-blue-500" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDelete(collection.id)}
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
