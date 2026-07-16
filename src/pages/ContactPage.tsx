import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { contactsApi } from '@/services/api/contacts';
import { Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';

export function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const submitContact = useMutation({
    mutationFn: () => contactsApi.create(name, email, message),
    onSuccess: () => {
      toast.success('Votre message a bien été envoyé. Nous vous répondrons sous 24h.');
      setName('');
      setEmail('');
      setMessage('');
    },
    onError: (error: any) => {
      toast.error('Erreur lors de l\'envoi du message : ' + error.message);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    submitContact.mutate();
  };

  return (
    <main className="pt-32 pb-24 px-6 min-h-screen bg-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl lg:text-5xl font-normal tracking-[-1.5px] mb-12">Contact Us</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {/* Form */}
          <div>
            <h2 className="text-lg font-medium mb-6">Send us a message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border-b border-gray-300 py-2 focus:border-black focus:outline-none transition-colors"
                  placeholder="Amine B."
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border-b border-gray-300 py-2 focus:border-black focus:outline-none transition-colors"
                  placeholder="amine@example.com"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">Message</label>
                <textarea
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="w-full border border-gray-300 p-4 focus:border-black focus:outline-none transition-colors resize-none"
                  placeholder="How can we help you?"
                />
              </div>
              <button
                type="submit"
                disabled={submitContact.isPending}
                className="px-8 py-4 bg-black text-white text-xs uppercase tracking-wider hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {submitContact.isPending ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          {/* Info */}
          <div className="space-y-12">
            <div>
              <h2 className="text-lg font-medium mb-6">Our Atelier</h2>
              <div className="space-y-6 text-[#666666]">
                <div className="flex items-center gap-4">
                  <Mail className="text-black shrink-0" size={20} />
                  <div>
                    <p className="text-sm font-medium text-black mb-1">Email</p>
                    <a href="mailto:support@summershop.ma" className="text-sm hover:text-black transition-colors">support@summershop.ma</a>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Phone className="text-black shrink-0" size={20} />
                  <div>
                    <p className="text-sm font-medium text-black mb-1">Phone</p>
                    <a href="tel:+212500000000" className="text-sm hover:text-black transition-colors">+212 5 00 00 00 00</a>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 bg-[#f9f9f9]">
              <h3 className="font-medium mb-2">Business Hours</h3>
              <p className="text-sm text-[#666666] mb-1">Monday - Friday: 9am - 6pm (GMT+1)</p>
              <p className="text-sm text-[#666666]">Saturday - Sunday: Closed</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
