import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, UploadCloud } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { useProducts } from '@/hooks/queries/useProducts';
import { useCategories } from '@/hooks/queries/useCategories';
import { useCollections } from '@/hooks/queries/useCollections';

const productSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  short_description: z.string().optional(),
  description: z.string().optional(),
  material: z.string().optional(),
  price: z.coerce.number().min(0, "Le prix doit être positif"),
  sale_price: z.coerce.number().min(0).optional().or(z.literal('')),
  stock: z.coerce.number().min(0, "Le stock ne peut pas être négatif").default(0),
  category_id: z.string().optional(),
  brand_id: z.string().optional(),
  collection_id: z.string().optional(),
  sizes: z.array(z.string()).min(1, "Veuillez sélectionner au moins une taille"),
  colors: z.array(z.string()).min(1, "Veuillez spécifier au moins une couleur"),
  // Structure d'images flexible pour le MVP
  images: z.any().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: any;
}

export function ProductFormModal({ open, onOpenChange, product }: ProductFormModalProps) {
  const { createProduct, updateProduct, isCreating, isUpdating } = useProducts();
  const { categories } = useCategories();
  const { collections } = useCollections();
  const isEditMode = !!product;

  const fileToBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      short_description: '',
      description: '',
      material: '',
      price: 0,
      stock: 0,
      sizes: [],
      colors: [],
      images: {}
    }
  });

  const selectedColors = useWatch({ control, name: 'colors' }) || [];

  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'TU'];
  
  const availableColors = [
    { name: 'Noir', hex: '#000000' },
    { name: 'Blanc', hex: '#FFFFFF' },
    { name: 'Gris', hex: '#808080' },
    { name: 'Marine', hex: '#000080' },
    { name: 'Beige', hex: '#F5F5DC' },
    { name: 'Rouge', hex: '#FF0000' }
  ];

  useEffect(() => {
    if (product) {
      reset({
        name: product.name || '',
        short_description: product.short_description || '',
        description: product.description || '',
        material: product.material || '',
        price: product.price || 0,
        sale_price: product.sale_price || '',
        stock: product.stock || 0, // In MVP stock is in product_sizes but let's leave simple
        category_id: product.category_id || '',
        collection_id: product.collection_id || '',
        sizes: product.sizes || [],
        colors: product.colors || [],
        images: {}
      });
    } else {
      reset({
        name: '',
        short_description: '',
        description: '',
        material: '',
        price: 0,
        sale_price: '',
        stock: 0,
        category_id: '',
        collection_id: '',
        sizes: [],
        colors: [],
        images: {}
      });
    }
  }, [product, reset]);

  const onSubmit = async (data: ProductFormValues) => {
    try {
      const dataToSubmit = { ...data };
      
      // Convert images to base64
      if (dataToSubmit.images) {
        if (dataToSubmit.images.default_primary?.[0]) {
          dataToSubmit.images.default_primary = await fileToBase64(dataToSubmit.images.default_primary[0]);
        } else {
          dataToSubmit.images.default_primary = undefined;
        }
        
        if (dataToSubmit.images.default_hover?.[0]) {
          dataToSubmit.images.default_hover = await fileToBase64(dataToSubmit.images.default_hover[0]);
        } else {
          dataToSubmit.images.default_hover = undefined;
        }
        
        if (dataToSubmit.images.colors) {
          for (const color of Object.keys(dataToSubmit.images.colors)) {
            if (dataToSubmit.images.colors[color]?.[0]) {
              dataToSubmit.images.colors[color] = await fileToBase64(dataToSubmit.images.colors[color][0]);
            } else {
              delete dataToSubmit.images.colors[color];
            }
          }
        }
      }

      if (isEditMode) {
        await updateProduct({ id: product.id, data: dataToSubmit });
        toast.success('Le produit a été modifié avec succès !');
      } else {
        await createProduct(dataToSubmit);
        toast.success('Le produit a été enregistré avec succès !');
      }
      
      onOpenChange(false);
      reset();
    } catch (error: any) {
      console.error(error);
      toast.error('Erreur lors de la sauvegarde : ' + (error.message || ''));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Modifier le Produit' : 'Ajouter un Produit'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Modifiez les informations du produit.' : 'Remplissez les informations du produit ci-dessous.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Colonne Principale */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Informations Générales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom du produit <span className="text-red-500">*</span></Label>
                    <Input id="name" {...register('name')} placeholder="T-shirt d'été..." />
                    {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category_id">Catégorie</Label>
                    <select
                      id="category_id"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      {...register('category_id')}
                    >
                      <option value="">Sélectionner une catégorie</option>
                      {categories.map((cat: any) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="collection_id">Collection (Optionnelle)</Label>
                    <select
                      id="collection_id"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      {...register('collection_id')}
                    >
                      <option value="">Aucune collection</option>
                      {collections.map((col: any) => (
                        <option key={col.id} value={col.id}>
                          {col.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="short_description">Description courte</Label>
                    <Input id="short_description" {...register('short_description')} placeholder="Une phrase accrocheuse..." />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description détaillée</Label>
                    <Textarea 
                      id="description" 
                      {...register('description')} 
                      placeholder="Détails du produit..."
                      className="min-h-[120px]"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Images Globales */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Images du Produit</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Image Principale (Défaut) */}
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Image Principale (Défaut)</Label>
                      <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer relative">
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          {...register(`images.default_primary`)}
                        />
                        <UploadCloud className="w-8 h-8 text-muted-foreground mb-2" />
                        <span className="text-sm font-medium">Cliquez ou glissez une image</span>
                      </div>
                    </div>
                    
                    {/* Image de Survol (Défaut) */}
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Image de Survol (Défaut)</Label>
                      <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer relative">
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          {...register(`images.default_hover`)}
                        />
                        <UploadCloud className="w-8 h-8 text-muted-foreground mb-2" />
                        <span className="text-sm font-medium">Cliquez ou glissez une image</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Images par Couleur */}
              {selectedColors.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Images par Couleur</CardTitle>
                    <p className="text-sm text-muted-foreground">Associez une image spécifique à chaque couleur sélectionnée.</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedColors.map((colorName) => {
                      const colorInfo = availableColors.find(c => c.name === colorName);
                      return (
                        <div key={colorName} className="flex flex-col sm:flex-row sm:items-center gap-4 border rounded-md p-4 bg-muted/30">
                          <div className="flex items-center gap-2 font-medium w-32 shrink-0">
                            <div 
                              className="w-4 h-4 rounded-full border shadow-sm"
                              style={{ backgroundColor: colorInfo?.hex || '#ccc' }}
                            />
                            {colorName}
                          </div>
                          
                          <div className="flex-1 w-full">
                            <div className="border-2 border-dashed rounded-lg p-3 flex flex-col sm:flex-row items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer relative h-[60px]">
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                {...register(`images.colors.${colorName}`)}
                              />
                              <UploadCloud className="w-5 h-5 text-muted-foreground sm:mr-2 mb-1 sm:mb-0" />
                              <span className="text-sm font-medium text-muted-foreground">Image pour {colorName}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Colonne Latérale */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Tarification & Inventaire</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Prix (MAD) <span className="text-red-500">*</span></Label>
                    <Input id="price" type="number" step="0.01" {...register('price')} />
                    {errors.price && <p className="text-sm text-red-500">{errors.price.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sale_price">Prix promo (MAD)</Label>
                    <Input id="sale_price" type="number" step="0.01" {...register('sale_price')} />
                  </div>
                  <div className="space-y-2 pt-2 border-t mt-2">
                    <Label htmlFor="stock">Stock disponible <span className="text-red-500">*</span></Label>
                    <Input id="stock" type="number" {...register('stock')} />
                    {errors.stock && <p className="text-sm text-red-500">{errors.stock.message}</p>}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Variantes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label>Tailles <span className="text-red-500">*</span></Label>
                    <div className="flex flex-wrap gap-2">
                      {availableSizes.map(size => (
                          <label key={size} className="cursor-pointer">
                            <input 
                              type="checkbox" 
                              value={size} 
                              {...register('sizes')} 
                              className="peer sr-only"
                            />
                            <div className="min-w-[36px] h-9 px-2 flex items-center justify-center border border-gray-200 rounded-md text-xs peer-checked:bg-black peer-checked:text-white peer-checked:border-black hover:border-gray-300 transition-colors">
                              {size}
                            </div>
                          </label>
                      ))}
                    </div>
                    {errors.sizes && <p className="text-sm text-red-500">{errors.sizes.message}</p>}
                  </div>

                  <div className="space-y-3">
                    <Label>Couleurs <span className="text-red-500">*</span></Label>
                    <div className="flex flex-wrap gap-2">
                      {availableColors.map(color => (
                        <label key={color.name} className="cursor-pointer" title={color.name}>
                          <input 
                            type="checkbox" 
                            value={color.name} 
                            {...register('colors')} 
                            className="peer sr-only"
                          />
                          <div 
                            className="w-7 h-7 rounded-full border-2 border-transparent peer-checked:border-black peer-checked:scale-110 transition-transform shadow-sm"
                            style={{ backgroundColor: color.hex, borderColor: color.name === 'Blanc' ? '#e5e7eb' : undefined }}
                          />
                        </label>
                      ))}
                    </div>
                    {errors.colors && <p className="text-sm text-red-500">{errors.colors.message}</p>}
                  </div>
                </CardContent>
              </Card>
            </div>

          </div>
          
          <DialogFooter className="pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isCreating || isUpdating}>Annuler</Button>
            <Button type="submit" disabled={isSubmitting || isCreating || isUpdating}>
              <Save className="w-4 h-4 mr-2" />
              {isCreating || isUpdating ? 'Enregistrement...' : (isEditMode ? 'Modifier le produit' : 'Enregistrer le produit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
