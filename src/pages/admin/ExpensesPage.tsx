import { useState } from 'react';
import { useFinance } from '@/hooks/queries/useFinance';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingDown, Plus, Trash2 } from 'lucide-react';

export function ExpensesPage() {
  const { expenses, isLoadingExpenses, createExpense, deleteExpense } = useFinance();
  const { profile } = useAuth();
  const isSuperadmin = profile?.role === 'superadmin';

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('marketing');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  if (!isSuperadmin) {
    return <div className="p-8 text-center">Accès refusé</div>;
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;
    
    await createExpense({
      amount: Number(amount),
      category,
      description,
      expense_date: date
    });
    
    setAmount('');
    setDescription('');
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <TrendingDown className="w-6 h-6 text-red-500" />
          Dépenses & Charges
        </h1>
        <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg font-bold text-lg border border-red-100">
          Total : {totalExpenses.toLocaleString('fr-MA')} MAD
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-medium mb-4">Ajouter une dépense</h2>
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Date</label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Catégorie</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="marketing">Marketing (Pub)</SelectItem>
                <SelectItem value="fournisseur">Fournisseur</SelectItem>
                <SelectItem value="logistique">Logistique / Livraison</SelectItem>
                <SelectItem value="logiciel">Logiciels / Hébergement</SelectItem>
                <SelectItem value="autre">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Montant (MAD)</label>
            <Input type="number" step="0.01" placeholder="Ex: 500" value={amount} onChange={(e) => setAmount(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Description</label>
            <Input type="text" placeholder="Détails..." value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <Button type="submit" className="w-full">
            <Plus className="w-4 h-4 mr-2" /> Ajouter
          </Button>
        </form>
      </div>

      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingExpenses ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8">Chargement...</TableCell></TableRow>
            ) : expenses.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Aucune dépense enregistrée.</TableCell></TableRow>
            ) : (
              expenses.map((exp) => (
                <TableRow key={exp.id}>
                  <TableCell>{new Date(exp.expense_date).toLocaleDateString('fr-FR')}</TableCell>
                  <TableCell className="capitalize">{exp.category}</TableCell>
                  <TableCell>{exp.description || '-'}</TableCell>
                  <TableCell className="font-medium text-red-600">{Number(exp.amount).toFixed(2)} MAD</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => {
                      if(window.confirm('Supprimer cette dépense ?')) deleteExpense(exp.id);
                    }}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
