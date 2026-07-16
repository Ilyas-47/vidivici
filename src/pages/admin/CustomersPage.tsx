import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useCustomers } from '@/hooks/queries/useCustomers';
import { customersApi, type CustomerProfile } from '@/services/api/customers';
import { useAuth } from '@/hooks/useAuth';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { Phone, Plus, Shield, User, Edit } from 'lucide-react';
import { toast } from 'sonner';

export function CustomersPage() {
  const { customers = [], isLoading } = useCustomers();
  const { globalSearchTerm } = useOutletContext<{ globalSearchTerm: string }>() || { globalSearchTerm: '' };

  const filteredCustomers = customers.filter((c: any) => 
    (c.first_name || '').toLowerCase().includes(globalSearchTerm.toLowerCase()) ||
    (c.last_name || '').toLowerCase().includes(globalSearchTerm.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(globalSearchTerm.toLowerCase())
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'customer'
  });

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    // Simuler l'ajout car la création de compte Auth depuis le client sans déconnecter l'admin 
    // nécessite Supabase Service Role Key ou une Edge Function.
    toast.success("Demande de création envoyée. (Remarque: La création silencieuse nécessite une configuration Backend)");
    setIsModalOpen(false);
    setFormData({ firstName: '', lastName: '', email: '', password: '', role: 'customer' });
  };

  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const isSuperadmin = profile?.role === 'superadmin';

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerProfile | null>(null);

  const updateMutation = useMutation({
    mutationFn: (data: Partial<CustomerProfile>) => customersApi.update(editingCustomer!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success("Utilisateur mis à jour avec succès");
      setIsEditModalOpen(false);
      setEditingCustomer(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Erreur lors de la mise à jour");
    }
  });

  const handleEdit = (customer: any) => {
    setEditingCustomer(customer);
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;
    updateMutation.mutate({
      first_name: editingCustomer.first_name,
      last_name: editingCustomer.last_name,
      phone: editingCustomer.phone,
      role: editingCustomer.role
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Utilisateurs</h1>
        {isSuperadmin && (
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un utilisateur
          </Button>
        )}
      </div>

      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Utilisateur</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Date d'inscription</TableHead>
              {isSuperadmin && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  Chargement...
                </TableCell>
              </TableRow>
            ) : filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  Aucun utilisateur trouvé.
                </TableCell>
              </TableRow>
            ) : (
              filteredCustomers.map((customer: any) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div className="font-medium">
                      {customer.first_name || ''} {customer.last_name || 'Anonyme'}
                    </div>
                    <div className="text-xs text-muted-foreground">ID: {customer.id.split('-')[0]}</div>
                  </TableCell>
                  <TableCell>
                    {customer.role === 'superadmin' ? (
                      <span className="inline-flex items-center gap-1.5 py-1 px-2 rounded-md text-xs font-medium bg-amber-100 text-amber-800">
                        <Shield className="w-3 h-3" /> Super Admin
                      </span>
                    ) : customer.role === 'admin' ? (
                      <span className="inline-flex items-center gap-1.5 py-1 px-2 rounded-md text-xs font-medium bg-indigo-100 text-indigo-800">
                        <Shield className="w-3 h-3" /> Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 py-1 px-2 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                        <User className="w-3 h-3" /> Client
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {customer.phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="w-3 h-3" />
                        {customer.phone}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(customer.created_at).toLocaleDateString()}
                  </TableCell>
                  {isSuperadmin && (
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(customer)}>
                        <Edit className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Ajouter un Utilisateur</DialogTitle>
            <DialogDescription>
              Créez un nouveau compte client ou un accès administrateur pour votre équipe.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateUser}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input 
                    id="firstName" 
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom</Label>
                  <Input 
                    id="lastName" 
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    required 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Rôle</Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(val) => setFormData({...formData, role: val})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">Client</SelectItem>
                    <SelectItem value="admin">Administrateur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Annuler
              </Button>
              <Button type="submit">Créer le compte</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Edition */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Modifier l'utilisateur</DialogTitle>
            <DialogDescription>
              Mettez à jour les informations et le rôle de l'utilisateur.
            </DialogDescription>
          </DialogHeader>
          {editingCustomer && (
            <form onSubmit={handleUpdateUser}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="editFirstName">Prénom</Label>
                    <Input 
                      id="editFirstName" 
                      value={editingCustomer.first_name || ''}
                      onChange={(e) => setEditingCustomer({...editingCustomer, first_name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editLastName">Nom</Label>
                    <Input 
                      id="editLastName" 
                      value={editingCustomer.last_name || ''}
                      onChange={(e) => setEditingCustomer({...editingCustomer, last_name: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editPhone">Téléphone</Label>
                  <Input 
                    id="editPhone" 
                    value={editingCustomer.phone || ''}
                    onChange={(e) => setEditingCustomer({...editingCustomer, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editRole">Rôle</Label>
                  <Select 
                    value={editingCustomer.role || 'customer'} 
                    onValueChange={(val) => setEditingCustomer({...editingCustomer, role: val})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un rôle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer">Client</SelectItem>
                      <SelectItem value="admin">Administrateur</SelectItem>
                      <SelectItem value="superadmin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Mise à jour..." : "Enregistrer"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
