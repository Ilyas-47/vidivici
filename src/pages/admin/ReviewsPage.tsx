import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { CheckCircle2, XCircle, Trash2, Star, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';
import { reviewsApi } from '@/services/api/reviews';

export function ReviewsPage() {
  const queryClient = useQueryClient();

  const { data: reviews = [], isLoading, refetch } = useQuery({
    queryKey: ['reviews'],
    queryFn: reviewsApi.getAll
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: 'approved' | 'rejected' }) => 
      reviewsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: reviewsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      toast.success('Avis supprimé');
    }
  });

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className={`w-3 h-3 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
        ))}
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Approuvé</span>;
      case 'rejected': return <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Rejeté</span>;
      default: return <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">En attente</span>;
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Gestion des Avis</h1>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCcw className="w-4 h-4 mr-2" />
          Actualiser
        </Button>
      </div>

      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produit / Client</TableHead>
              <TableHead>Note</TableHead>
              <TableHead className="w-1/2">Commentaire</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">Chargement...</TableCell>
              </TableRow>
            ) : reviews.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">Aucun avis trouvé.</TableCell>
              </TableRow>
            ) : (
              reviews.map((review: any) => {
                const customerName = review.profiles ? `${review.profiles.first_name || ''} ${review.profiles.last_name || ''}`.trim() : 'Invité';
                return (
                  <TableRow key={review.id}>
                    <TableCell>
                      <div className="font-medium text-sm">{review.products?.name || 'Produit inconnu'}</div>
                      <div className="text-xs text-muted-foreground">{customerName || 'Anonyme'} • {new Date(review.created_at).toLocaleDateString()}</div>
                    </TableCell>
                    <TableCell>
                      {renderStars(review.rating)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {review.comment}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(review.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        {review.status !== 'approved' && (
                          <Button variant="ghost" size="icon" onClick={() => {
                            updateMutation.mutate({ id: review.id, status: 'approved' });
                            toast.success('Avis approuvé');
                          }}>
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          </Button>
                        )}
                        {review.status !== 'rejected' && (
                          <Button variant="ghost" size="icon" onClick={() => {
                            updateMutation.mutate({ id: review.id, status: 'rejected' });
                            toast.error('Avis rejeté');
                          }}>
                            <XCircle className="w-4 h-4 text-orange-500" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => {
                          if (window.confirm("Supprimer cet avis ?")) {
                            deleteMutation.mutate(review.id);
                          }
                        }}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
