import { useState } from 'react';
import { useFinance } from '@/hooks/queries/useFinance';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Plus, Trash2, CheckCircle, XCircle } from 'lucide-react';

export function SalariesPage() {
  const { salaries, isLoadingSalaries, createSalary, updateSalaryStatus, deleteSalary } = useFinance();
  const { profile } = useAuth();
  const isSuperadmin = profile?.role === 'superadmin';

  const [employeeName, setEmployeeName] = useState('');
  const [amount, setAmount] = useState('');
  const [monthYear, setMonthYear] = useState('');

  if (!isSuperadmin) {
    return <div className="p-8 text-center">Accès refusé</div>;
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || !employeeName || !monthYear) return;
    
    await createSalary({
      employee_name: employeeName,
      amount: Number(amount),
      month_year: monthYear,
      status: 'unpaid'
    });
    
    setEmployeeName('');
    setAmount('');
    setMonthYear('');
  };

  const totalPaid = salaries.filter(s => s.status === 'paid').reduce((sum, s) => sum + Number(s.amount), 0);
  const totalUnpaid = salaries.filter(s => s.status === 'unpaid').reduce((sum, s) => sum + Number(s.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Users className="w-6 h-6 text-blue-500" />
          Salaires de l'Équipe
        </h1>
        <div className="flex gap-4">
          <div className="bg-orange-50 text-orange-700 px-4 py-2 rounded-lg font-medium border border-orange-100">
            À Payer : {totalUnpaid.toLocaleString('fr-MA')} MAD
          </div>
          <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg font-medium border border-green-100">
            Payé : {totalPaid.toLocaleString('fr-MA')} MAD
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-medium mb-4">Ajouter un salaire (Mois/Employé)</h2>
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Nom de l'employé</label>
            <Input type="text" placeholder="Ex: Ilyas" value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Mois / Année</label>
            <Input type="text" placeholder="Ex: 07-2026" value={monthYear} onChange={(e) => setMonthYear(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Montant (MAD)</label>
            <Input type="number" step="0.01" placeholder="Ex: 4000" value={amount} onChange={(e) => setAmount(e.target.value)} required />
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
              <TableHead>Employé</TableHead>
              <TableHead>Mois / Année</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingSalaries ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8">Chargement...</TableCell></TableRow>
            ) : salaries.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Aucun salaire enregistré.</TableCell></TableRow>
            ) : (
              salaries.map((salary) => (
                <TableRow key={salary.id}>
                  <TableCell className="font-medium">{salary.employee_name}</TableCell>
                  <TableCell>{salary.month_year}</TableCell>
                  <TableCell className="font-medium">{Number(salary.amount).toFixed(2)} MAD</TableCell>
                  <TableCell>
                    {salary.status === 'paid' ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        <CheckCircle className="w-3 h-3 mr-1" /> Payé
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                        <XCircle className="w-3 h-3 mr-1" /> Non Payé
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {salary.status === 'unpaid' ? (
                      <Button variant="outline" size="sm" onClick={() => updateSalaryStatus({ id: salary.id, status: 'paid' })}>
                        Marquer Payé
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => updateSalaryStatus({ id: salary.id, status: 'unpaid' })}>
                        Annuler
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => {
                      if(window.confirm('Supprimer ce salaire ?')) deleteSalary(salary.id);
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
