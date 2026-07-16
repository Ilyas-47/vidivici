import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { logsApi } from '@/services/api/logs';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Activity, ChevronLeft, ChevronRight } from 'lucide-react';

type LogEntry = {
  id: string;
  created_at: string;
  user_email: string;
  action: string;
  target: string;
  type: string;
};

export function LogsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['systemLogs'],
    queryFn: logsApi.getAll
  });

  const filteredLogs = logs.filter((log: LogEntry) => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user_email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || log.type === filterType;

    return matchesSearch && matchesType;
  });

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset to first page when filters change
  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  const handleTypeChange = (val: string) => {
    setFilterType(val);
    setCurrentPage(1);
  };

  const getTypeBadge = (type: string) => {
    switch(type) {
      case 'auth': return <Badge variant="outline" className="text-blue-500 border-blue-500">Auth</Badge>;
      case 'product': return <Badge variant="outline" className="text-purple-500 border-purple-500">Produit</Badge>;
      case 'order': return <Badge variant="outline" className="text-green-500 border-green-500">Commande</Badge>;
      case 'system': return <Badge variant="outline" className="text-gray-500 border-gray-500">Système</Badge>;
      case 'customer': return <Badge variant="outline" className="text-orange-500 border-orange-500">Client</Badge>;
      default: return <Badge variant="outline" className="text-gray-500 border-gray-500">{type}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Logs Système</h1>
          <p className="text-muted-foreground">Historique des actions effectuées sur la plateforme.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-muted-foreground" />
            <CardTitle className="text-base font-medium">Journal d'activité</CardTitle>
          </div>
          <div className="flex items-center gap-4">
            <Select value={filterType} onValueChange={handleTypeChange}>
              <SelectTrigger className="w-[150px] h-9">
                <SelectValue placeholder="Tous les types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="auth">Authentification</SelectItem>
                <SelectItem value="product">Produits</SelectItem>
                <SelectItem value="order">Commandes</SelectItem>
                <SelectItem value="system">Système</SelectItem>
                <SelectItem value="customer">Clients</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher un log..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-8 h-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Date & Heure</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Cible</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Chargement des logs...
                  </TableCell>
                </TableRow>
              ) : paginatedLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Aucun log trouvé
                  </TableCell>
                </TableRow>
              ) : (
                paginatedLogs.map((log: LogEntry) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(log.created_at).toLocaleString('fr-FR')}
                    </TableCell>
                    <TableCell>{getTypeBadge(log.type)}</TableCell>
                    <TableCell className="font-medium">{log.user_email}</TableCell>
                    <TableCell>{log.action}</TableCell>
                    <TableCell className="text-muted-foreground">{log.target}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {!isLoading && totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Affichage de {(currentPage - 1) * itemsPerPage + 1} à {Math.min(currentPage * itemsPerPage, filteredLogs.length)} sur {filteredLogs.length} logs
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Précédent
                </Button>
                <div className="text-sm font-medium px-2">
                  Page {currentPage} sur {totalPages}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Suivant
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
