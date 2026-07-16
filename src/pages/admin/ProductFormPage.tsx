import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';

const productSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  short_description: z.string().optional(),
  description: z.string().optional(),
  material: z.string().optional(),
  price: z.coerce.number().min(0, "Le prix doit être positif"),
  sale_price: z.coerce.number().min(0).optional().or(z.literal('')),
  category_id: z.string().optional(),
  brand_id: z.string().optional(),
  collection_id: z.string().optional(),
  sizes: z.array(z.string()).min(1, "Veuillez sélectionner au moins une taille"),
  colors: z.array(z.string()).min(1, "Veuillez spécifier au moins une couleur"),
});

type ProductFormValues = z.infer<typeof productSchema>;

export function ProductFormPage() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      short_description: '',
      description: '',
      material: '',
      price: 0,
      sizes: [],
      colors: [],
    }
  });

  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'TU'];
  
  // Couleurs de base suggérées (l'utilisateur pourra en ajouter d'autres plus tard si besoin)
  const availableColors = [
    { name: 'Noir', hex: '#000000' },
    { name: 'Blanc', hex: '#FFFFFF' },
    { name: 'Gris', hex: '#808080' },
    { name: 'Marine', hex: '#000080' },
    { name: 'Beige', hex: '#F5F5DC' },
    { name: 'Rouge', hex: '#FF0000' }
  ];

  const onSubmit = async (data: ProductFormValues) => {
    try {
      console.log('Données soumises :', data);
      toast.success('Le produit a été enregistré (simulation pour le moment)');
      // navigate('/admin/products');
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/admin/products')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Ajouter un Produit</h1>
        </div>
        <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
          <Save className="w-4 h-4 mr-2" />
          Enregistrer
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Colonne Principale */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations Générales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom du produit <span className="text-red-500">*</span></Label>
                  <Input id="name" {...register('name')} placeholder="T-shirt d'été..." />
                  {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
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
                    className="min-h-[150px]"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Colonne Latérale */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tarification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Prix (MAD) <span className="text-red-500">*</span></Label>
                  <Input id="price" type="number" step="0.01" {...register('price')} />
                  {errors.price && <p className="text-sm text-red-500">{errors.price.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sale_price">Prix promotionnel (MAD)</Label>
                  <Input id="sale_price" type="number" step="0.01" {...register('sale_price')} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Caractéristiques</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="material">Matière</Label>
                  <Input id="material" {...register('material')} placeholder="100% Coton..." />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Variantes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Tailles disponibles <span className="text-red-500">*</span></Label>
                  <div className="flex flex-wrap gap-2">
                    {availableSizes.map(size => (
                        <label key={size} className="cursor-pointer">
                          <input 
                            type="checkbox" 
                            value={size} 
                            {...register('sizes')} 
                            className="peer sr-only"
                          />
                          <div className="min-w-[40px] h-10 px-3 flex items-center justify-center border border-gray-200 rounded-md text-sm peer-checked:bg-black peer-checked:text-white peer-checked:border-black hover:border-gray-300 transition-colors">
                            {size}
                          </div>
                        </label>
                    ))}
                  </div>
                  {errors.sizes && <p className="text-sm text-red-500">{errors.sizes.message}</p>}
                </div>

                <div className="space-y-3">
                  <Label>Couleurs de base <span className="text-red-500">*</span></Label>
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
                          className="w-8 h-8 rounded-full border-2 border-transparent peer-checked:border-black peer-checked:scale-110 transition-transform shadow-sm"
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
      </form>
    </div>
  );
}
