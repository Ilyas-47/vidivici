import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCart } from '@/hooks/useCart';
import { shippingZonesApi } from '@/services/api/shippingZones';
import { ordersApi } from '@/services/api/orders';
import { promoCodesApi } from '@/services/api/promoCodes';
import type { PromoCode } from '@/services/api/promoCodes';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';

const checkoutSchema = z.object({
  customer_name: z.string().min(2, "Nom complet requis"),
  customer_email: z.string().email("Email invalide").optional().or(z.literal('')),
  customer_phone: z.string().min(10, "Numéro de téléphone invalide"),
  shipping_address: z.string().optional().or(z.literal('')),
  shipping_city: z.string().min(1, "Ville requise"),
  notes: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { session, profile } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromoCode, setAppliedPromoCode] = useState<PromoCode | null>(null);
  const [promoError, setPromoError] = useState('');
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customer_name: '',
      customer_email: '',
      customer_phone: '',
      shipping_address: '',
      shipping_city: '',
      notes: ''
    }
  });

  useEffect(() => {
    if (session?.user) {
      // Pré-remplissage du nom si le profil existe
      if (profile && (profile.first_name || profile.last_name)) {
        const currentName = watch('customer_name');
        if (!currentName) {
          setValue('customer_name', `${profile.first_name || ''} ${profile.last_name || ''}`.trim());
        }
      }
      
      // Pré-remplissage de l'email
      const currentEmail = watch('customer_email');
      if (!currentEmail && session.user.email) {
        setValue('customer_email', session.user.email);
      }
    }
  }, [session, profile, setValue, watch]);

  const { data: shippingZones = [] } = useQuery({
    queryKey: ['shippingZones'],
    queryFn: shippingZonesApi.getActive
  });

  const selectedCityName = watch('shipping_city');
  const cityInfo = shippingZones.find((c: any) => c.city_name === selectedCityName);
  
  let shippingFee = cityInfo ? Number(cityInfo.shipping_cost) : 0;
  
  // Livraison gratuite à partir de 1000 MAD
  if (totalPrice >= 1000) {
    shippingFee = 0;
  }
  
  // Calcul de la réduction
  let discountAmount = 0;
  if (appliedPromoCode) {
    if (appliedPromoCode.discount_type === 'percentage') {
      discountAmount = (totalPrice * appliedPromoCode.discount_value) / 100;
    } else {
      discountAmount = appliedPromoCode.discount_value;
    }
  }

  // Ne pas avoir un total négatif
  const finalTotal = Math.max(0, totalPrice - discountAmount + shippingFee);

  const handleApplyPromo = async () => {
    if (!promoCodeInput.trim()) return;
    
    setIsValidatingPromo(true);
    setPromoError('');
    
    try {
      const code = await promoCodesApi.validateCode(promoCodeInput.trim());
      setAppliedPromoCode(code);
      setPromoCodeInput('');
      toast.success('Code promo appliqué !');
    } catch (err: any) {
      setPromoError(err.message || 'Code promo invalide');
      setAppliedPromoCode(null);
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromoCode(null);
    setPromoCodeInput('');
    setPromoError('');
  };

  if (items.length === 0 && !isSubmitting) {
    return (
      <main className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl mb-4">Votre panier est vide</h2>
          <button
            onClick={() => navigate('/shop')}
            className="px-8 py-3 bg-black text-white text-xs uppercase tracking-wider"
          >
            Retour à la boutique
          </button>
        </div>
      </main>
    );
  }

  const onSubmit = async (data: CheckoutFormValues) => {
    setIsSubmitting(true);
    try {
      const orderData = {
        user_id: session?.user?.id || null,
        customer_name: data.customer_name,
        customer_email: data.customer_email || null,
        customer_phone: data.customer_phone,
        shipping_address: data.shipping_address,
        shipping_city: data.shipping_city,
        notes: data.notes,
        status: 'pending',
        subtotal: totalPrice,
        shipping_fee: shippingFee,
        tax_amount: 0,
        discount_amount: discountAmount,
        total_amount: finalTotal,
      };

      const paymentData = {
        provider: 'Cash on Delivery',
        payment_method: 'cash',
        amount: finalTotal,
        status: 'pending'
      };

      const newOrder = await ordersApi.create(orderData, items, paymentData);
      
      if (appliedPromoCode) {
        try {
          await promoCodesApi.update(appliedPromoCode.id, {
            used_count: appliedPromoCode.used_count + 1
          });
        } catch (e) {
          console.error("Impossible d'incrémenter le code promo", e);
        }
      }

      clearCart();
      navigate('/checkout/success', { state: { orderId: newOrder.id } });
    } catch (error: any) {
      console.error('Erreur lors de la commande:', error);
      toast.error('Une erreur est survenue lors de la validation de votre commande.');
      setIsSubmitting(false);
    }
  };

  return (
    <main className="pt-16 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-normal tracking-[-0.96px] mb-8">Paiement</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Formulaire */}
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-white p-8 border border-gray-200">
              <h2 className="text-lg mb-6 uppercase tracking-wider text-sm border-b pb-4">Adresse de livraison</h2>
              
              <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm">Nom complet</label>
                  <input 
                    type="text" 
                    {...register('customer_name')}
                    className="w-full border border-gray-300 p-3 focus:border-black focus:outline-none"
                    placeholder="ex: Ahmed Alaoui"
                  />
                  {errors.customer_name && <p className="text-xs text-red-500">{errors.customer_name.message}</p>}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm">Téléphone</label>
                    <input 
                      type="tel" 
                      {...register('customer_phone')}
                      className="w-full border border-gray-300 p-3 focus:border-black focus:outline-none"
                      placeholder="06 XX XX XX XX"
                    />
                    {errors.customer_phone && <p className="text-xs text-red-500">{errors.customer_phone.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm">Email (Optionnel)</label>
                    <input 
                      type="email" 
                      {...register('customer_email')}
                      className="w-full border border-gray-300 p-3 focus:border-black focus:outline-none"
                      placeholder="email@exemple.com"
                    />
                    {errors.customer_email && <p className="text-xs text-red-500">{errors.customer_email.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm">Ville</label>
                  <select
                    {...register('shipping_city')}
                    className="w-full border border-gray-300 p-3 focus:border-black focus:outline-none bg-white"
                  >
                    <option value="">Sélectionnez votre ville</option>
                    {shippingZones.map((zone: any) => (
                      <option key={zone.id} value={zone.city_name}>{zone.city_name}</option>
                    ))}
                  </select>
                  {errors.shipping_city && <p className="text-xs text-red-500">{errors.shipping_city.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm">Adresse détaillée (Optionnel)</label>
                  <textarea 
                    {...register('shipping_address')}
                    className="w-full border border-gray-300 p-3 h-24 resize-none focus:border-black focus:outline-none"
                    placeholder="Quartier, rue, n° de maison, appartement..."
                  />
                  {errors.shipping_address && <p className="text-xs text-red-500">{errors.shipping_address.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm">Note pour le livreur (Optionnel)</label>
                  <textarea 
                    {...register('notes')}
                    className="w-full border border-gray-300 p-3 h-16 resize-none focus:border-black focus:outline-none"
                  />
                </div>
              </form>
            </div>

            <div className="bg-white p-8 border border-gray-200">
              <h2 className="text-lg mb-6 uppercase tracking-wider text-sm border-b pb-4">Mode de Paiement</h2>
              <div className="border border-black p-4 bg-gray-50 flex items-center gap-3">
                <input type="radio" checked readOnly className="accent-black" />
                <span className="text-sm">Paiement à la livraison (Cash on Delivery)</span>
              </div>
            </div>
          </div>

          {/* Récapitulatif */}
          <div className="lg:col-span-5">
            <div className="bg-white p-8 border border-gray-200 sticky top-24">
              <h2 className="text-lg mb-6 uppercase tracking-wider text-sm border-b pb-4">Récapitulatif de la commande</h2>
              
              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2">
                {items.map((item, idx) => {
                  const price = item.product.sale_price ? Number(item.product.sale_price) : Number(item.product.price);
                  return (
                    <div key={idx} className="flex gap-4">
                      <div className="w-16 h-16 bg-gray-100 flex-shrink-0">
                        <img 
                          src={(item.product as any).images?.colors?.[item.color] || (item.product as any).images?.default_primary || (item.product as any).imagePrimary}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 flex flex-col justify-center">
                        <span className="text-sm">{item.product.name}</span>
                        <span className="text-xs text-gray-500">Taille: {item.size} / Couleur: {item.color}</span>
                        <span className="text-xs text-gray-500">Qté: {item.quantity}</span>
                      </div>
                      <div className="text-sm flex flex-col justify-center items-end">
                        {(price * item.quantity).toLocaleString()} MAD
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-3 pt-6 border-t border-gray-100 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Sous-total</span>
                  <span>{totalPrice.toLocaleString()} MAD</span>
                </div>
                
                {/* Section Code Promo */}
                <div className="pt-2 pb-2">
                  {!appliedPromoCode ? (
                    <div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={promoCodeInput}
                          onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                          placeholder="Code promo"
                          className="flex-1 border border-gray-300 p-2 focus:border-black focus:outline-none uppercase text-sm"
                        />
                        <button
                          type="button"
                          onClick={handleApplyPromo}
                          disabled={isValidatingPromo || !promoCodeInput.trim()}
                          className="bg-black text-white px-4 py-2 text-xs uppercase tracking-wider disabled:opacity-50"
                        >
                          {isValidatingPromo ? '...' : 'Appliquer'}
                        </button>
                      </div>
                      {promoError && <p className="text-xs text-red-500 mt-1">{promoError}</p>}
                    </div>
                  ) : (
                    <div className="flex justify-between items-center bg-gray-50 p-2 border border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-green-600">{appliedPromoCode.code}</span>
                        <span className="text-xs text-gray-500">
                          (-{appliedPromoCode.discount_type === 'percentage' ? `${appliedPromoCode.discount_value}%` : `${appliedPromoCode.discount_value} MAD`})
                        </span>
                      </div>
                      <button type="button" onClick={handleRemovePromo} className="text-gray-400 hover:text-red-500 text-xs">
                        Retirer
                      </button>
                    </div>
                  )}
                </div>

                {appliedPromoCode && (
                  <div className="flex justify-between text-green-600">
                    <span>Réduction</span>
                    <span>-{discountAmount.toLocaleString()} MAD</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-500">Livraison</span>
                  <span>
                    {shippingFee === 0 ? 'Gratuite' : `${shippingFee.toLocaleString()} MAD`}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-6 mt-6 border-t border-gray-200 text-lg">
                <span>Total</span>
                <span className="font-medium">{finalTotal.toLocaleString()} MAD</span>
              </div>

              <button
                type="submit"
                form="checkout-form"
                disabled={isSubmitting}
                className="w-full mt-8 py-4 bg-black text-white text-xs uppercase tracking-wider hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Traitement en cours...' : 'Confirmer la Commande'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
