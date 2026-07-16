import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ShoppingCart, Users, DollarSign, TrendingDown } from 'lucide-react';
import { useStats } from '@/hooks/queries/useStats';
import { useFinance } from '@/hooks/queries/useFinance';
import { useAuth } from '@/hooks/useAuth';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

export function DashboardPage() {
  const { stats, isLoading } = useStats();
  const { expenses, salaries } = useFinance();
  const { profile } = useAuth();
  const isSuperadmin = profile?.role === 'superadmin';

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Chargement des statistiques...</div>;
  }

  const data = stats || {
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    totalShippingFees: 0,
    salesData: [],
    recentOrders: []
  };
  const totalExpenses = expenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0;
  const totalSalaries = salaries?.filter(s => s.status === 'paid').reduce((sum, s) => sum + Number(s.amount), 0) || 0;
  const netProfit = data.totalRevenue - totalExpenses - totalSalaries;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isSuperadmin && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Bénéfice Net</CardTitle>
              <DollarSign className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{netProfit.toLocaleString('fr-MA')} MAD</div>
              <p className="text-xs text-muted-foreground">Revenus - Charges</p>
            </CardContent>
          </Card>
        )}

        {isSuperadmin && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Revenu Brut</CardTitle>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.totalRevenue.toLocaleString('fr-MA')} MAD</div>
              <p className="text-xs text-muted-foreground">Recette totale</p>
            </CardContent>
          </Card>
        )}

        {isSuperadmin && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Charges Totales</CardTitle>
              <TrendingDown className="w-4 h-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{(totalExpenses + totalSalaries).toLocaleString('fr-MA')} MAD</div>
              <p className="text-[10px] text-muted-foreground mt-1">
                Dépenses: {totalExpenses} / Salaires: {totalSalaries}
              </p>
            </CardContent>
          </Card>
        )}

        {isSuperadmin && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Frais de Livraison</CardTitle>
              <Package className="w-4 h-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{data.totalShippingFees.toLocaleString('fr-MA')} MAD</div>
              <p className="text-xs text-muted-foreground mt-1">
                Coût des expéditions
              </p>
            </CardContent>
          </Card>
        )}
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Commandes</CardTitle>
            <ShoppingCart className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalOrders}</div>
            <p className="text-xs text-muted-foreground">Toutes les commandes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Produits Actifs</CardTitle>
            <Package className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalProducts}</div>
            <p className="text-xs text-muted-foreground">Dans le catalogue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Clients</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">Inscrits</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {isSuperadmin && (
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Aperçu des Ventes</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.salesData}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#000000" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#000000" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} tickFormatter={(val) => `${val} MAD`} />
                  <CartesianGrid vertical={false} stroke="#eee" />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => [`${value} MAD`, 'Revenu']}
                  />
                  <Area type="monotone" dataKey="amount" stroke="#000000" fillOpacity={1} fill="url(#colorAmount)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
        <Card className={isSuperadmin ? "col-span-3" : "col-span-7"}>
          <CardHeader>
            <CardTitle>Dernières Commandes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {data.recentOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Aucune commande récente
                </p>
              ) : (
                data.recentOrders.map((order: any) => (
                  <div key={order.id} className="flex items-center">
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">{order.customer_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="ml-auto font-medium">
                      +{order.total_amount} MAD
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
