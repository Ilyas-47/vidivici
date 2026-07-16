import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contactsApi } from '@/services/api/contacts';
import { Mail, Trash2, Eye } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

export function ContactMessagesPage() {
  const queryClient = useQueryClient();
  const [selectedMessage, setSelectedMessage] = useState<any>(null);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['contact_messages'],
    queryFn: contactsApi.getAll
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string, status: 'unread' | 'read' | 'replied' }) => contactsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact_messages'] });
      toast.success('Statut mis à jour');
    },
    onError: (err: any) => toast.error(err.message)
  });

  const deleteMessage = useMutation({
    mutationFn: contactsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact_messages'] });
      toast.success('Message supprimé');
    },
    onError: (err: any) => toast.error(err.message)
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Mail className="w-6 h-6" />
            Messages de Contact
          </h1>
          <p className="text-gray-500">Gérez les messages reçus depuis le formulaire de contact.</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Chargement...</div>
        ) : messages.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Aucun message de contact.</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 font-medium text-gray-600">Date</th>
                <th className="p-4 font-medium text-gray-600">Expéditeur</th>
                <th className="p-4 font-medium text-gray-600">Message</th>
                <th className="p-4 font-medium text-gray-600">Statut</th>
                <th className="p-4 font-medium text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {messages.map((msg: any) => (
                <tr key={msg.id} className={`hover:bg-gray-50 ${msg.status === 'unread' ? 'bg-blue-50/30' : ''}`}>
                  <td className="p-4 text-sm text-gray-500 whitespace-nowrap">
                    {new Date(msg.created_at).toLocaleDateString('fr-FR', {
                      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit'
                    })}
                  </td>
                  <td className="p-4">
                    <div className="font-medium">{msg.name}</div>
                    <div className="text-xs text-gray-500">
                      <a href={`mailto:${msg.email}`} className="hover:underline">{msg.email}</a>
                    </div>
                  </td>
                  <td className="p-4 text-sm max-w-[200px] truncate" title={msg.message}>
                    {msg.message}
                  </td>
                  <td className="p-4">
                    <select
                      value={msg.status}
                      onChange={(e) => updateStatus.mutate({ id: msg.id, status: e.target.value as any })}
                      className={`text-xs px-2 py-1 rounded-full outline-none border cursor-pointer ${
                        msg.status === 'unread' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                        msg.status === 'read' ? 'bg-gray-100 text-gray-700 border-gray-200' :
                        'bg-green-100 text-green-700 border-green-200'
                      }`}
                    >
                      <option value="unread">Non lu</option>
                      <option value="read">Lu</option>
                      <option value="replied">Répondu</option>
                    </select>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => setSelectedMessage(msg)}
                        className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                        title="Lire le message"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Voulez-vous vraiment supprimer ce message ?')) {
                            deleteMessage.mutate(msg.id);
                          }
                        }}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Dialog open={!!selectedMessage} onOpenChange={(open) => !open && setSelectedMessage(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Détails du Message</DialogTitle>
            <DialogDescription>
              Reçu le {selectedMessage && new Date(selectedMessage.created_at).toLocaleDateString('fr-FR', {
                day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit'
              })}
            </DialogDescription>
          </DialogHeader>
          
          {selectedMessage && (
            <div className="mt-4 space-y-6">
              <div>
                <h3 className="font-semibold mb-2 text-sm text-gray-500">Expéditeur</h3>
                <div className="text-sm bg-muted p-4 rounded-md">
                  <p><span className="text-muted-foreground mr-2">Nom:</span> {selectedMessage.name}</p>
                  <p><span className="text-muted-foreground mr-2">Email:</span> {selectedMessage.email}</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2 text-sm text-gray-500">Message</h3>
                <div className="text-sm bg-muted p-4 rounded-md whitespace-pre-wrap leading-relaxed">
                  {selectedMessage.message}
                </div>
              </div>

              <div className="flex justify-end border-t pt-4">
                  <a
                    href={`mailto:${selectedMessage.email}?subject=Réponse: Votre message pour Summer Shop`}
                    className="px-4 py-2 bg-black text-white text-xs uppercase tracking-wider rounded-md hover:bg-gray-800 transition-colors"
                  >
                  Répondre par Email
                </a>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
