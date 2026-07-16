import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Save, Store, Receipt, Link as LinkIcon, Settings2 } from 'lucide-react';
import { toast } from 'sonner';

export function SettingsPage() {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      shopName: 'Vidi Vici',
      contactEmail: 'contact@summershop.ma',
      currency: 'MAD',
      taxRate: 20,
      instagram: 'https://instagram.com/summershop',
      tiktok: '',
      facebook: '',
      promoBanner: 'Livraison gratuite à partir de 500 MAD !'
    }
  });

  const onSubmit = (data: any) => {
    console.log('Paramètres sauvegardés:', data);
    toast.success('Paramètres mis à jour avec succès');
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Paramètres</h1>
          <p className="text-muted-foreground">Gérez la configuration globale de votre boutique.</p>
        </div>
        <Button onClick={handleSubmit(onSubmit)}>
          <Save className="w-4 h-4 mr-2" />
          Enregistrer
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Navigation des paramètres (Simulée visuellement par l'ordre) */}
        <div className="md:col-span-2 space-y-6">

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-muted-foreground" />
                <CardTitle className="text-lg">Informations de la Boutique</CardTitle>
              </div>
              <CardDescription>Les détails publics de votre marque.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shopName">Nom de la boutique</Label>
                  <Input id="shopName" {...register('shopName')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Email de contact</Label>
                  <Input id="contactEmail" type="email" {...register('contactEmail')} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-muted-foreground" />
                <CardTitle className="text-lg">Finances & Taxes</CardTitle>
              </div>
              <CardDescription>Configuration de la devise et de la TVA par défaut.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Devise par défaut</Label>
                  <Input id="currency" {...register('currency')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxRate">Taux de TVA (%)</Label>
                  <Input id="taxRate" type="number" {...register('taxRate')} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-muted-foreground" />
                <CardTitle className="text-lg">Réseaux Sociaux</CardTitle>
              </div>
              <CardDescription>Liens vers vos profils sociaux pour le footer.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram URL</Label>
                <Input id="instagram" {...register('instagram')} placeholder="https://instagram.com/..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tiktok">TikTok URL</Label>
                <Input id="tiktok" {...register('tiktok')} placeholder="https://tiktok.com/@..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="facebook">Facebook URL</Label>
                <Input id="facebook" {...register('facebook')} placeholder="https://facebook.com/..." />
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Sidebar des Paramètres Supplémentaires */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-muted-foreground" />
                <CardTitle className="text-lg">Affichage du Site</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="promoBanner">Bannière promotionnelle (Haut de page)</Label>
                <Input id="promoBanner" {...register('promoBanner')} placeholder="Ex: Livraison gratuite..." />
                <p className="text-xs text-muted-foreground mt-1">Laissez vide pour masquer la bannière.</p>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
