import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { X, Mail, CheckCircle } from 'lucide-react';

interface SupportMessage {
  id: string;
  userid: string;
  fullname: string;
  email: string;
  category: string;
  message: string;
  response?: string;
  status: string;
  created_at: string;
  answered_at?: string;
}

const AdminSupport: React.FC = () => {
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<SupportMessage | null>(null);
  const [response, setResponse] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('support_messages')
      .select('*')
      .order('created_at', { ascending: false });
    setMessages(data || []);
    setLoading(false);
  };

  const handleRespond = async () => {
    if (!selected) return;
    setSending(true);
    const { error } = await supabase
      .from('support_messages')
      .update({ response, status: 'answered', answered_at: new Date().toISOString() })
      .eq('id', selected.id);
    setSending(false);
    if (!error) {
      setSelected(null);
      setResponse('');
      fetchMessages();
    } else {
      alert("Erreur lors de l'envoi de la réponse.");
    }
  };
  

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Messages de support</h1>
        <p className="text-blue-100">Consultez et répondez aux messages envoyés par les utilisateurs</p>
      </div>
      <div className="bg-white rounded-2xl shadow-sm p-6">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-gray-400">Aucun message</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-400 text-sm">
                <th className="pb-3 font-medium">Nom</th>
                <th className="pb-3 font-medium">Email</th>
                <th className="pb-3 font-medium">Catégorie</th>
                <th className="pb-3 font-medium">Message</th>
                <th className="pb-3 font-medium">Statut</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-900">
              {messages.map(msg => (
                <tr key={msg.id} className="border-t border-gray-200">
                  <td className="py-3">{msg.fullname}</td>
                  <td className="py-3">{msg.email}</td>
                  <td className="py-3">{msg.category}</td>
                  <td className="py-3 max-w-xs truncate">{msg.message}</td>
                  <td className="py-3">
                    {msg.status === 'answered' ? (
                      <span className="inline-flex items-center text-green-600 font-semibold"><CheckCircle className="w-4 h-4 mr-1" />Répondu</span>
                    ) : (
                      <span className="inline-flex items-center text-yellow-600 font-semibold"><Mail className="w-4 h-4 mr-1" />En attente</span>
                    )}
                  </td>
                  <td className="py-3">
                    <button
                      className="text-blue-600 hover:text-blue-800 font-medium"
                      onClick={() => { setSelected(msg); setResponse(msg.response || ''); }}
                    >
                      Répondre
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {/* Modal de réponse */}
      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg relative">
            <button onClick={() => setSelected(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700" title="Fermer">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-blue-700 mb-2">Répondre à {selected.fullname}</h2>
            <p className="text-gray-700 mb-2"><span className="font-semibold">Email :</span> {selected.email}</p>
            <p className="text-gray-700 mb-2"><span className="font-semibold">Catégorie :</span> {selected.category}</p>
            <p className="text-gray-700 mb-4"><span className="font-semibold">Message :</span> {selected.message}</p>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
              rows={5}
              value={response}
              onChange={e => setResponse(e.target.value)}
              placeholder="Votre réponse à l'utilisateur..."
            />
            <div className="flex justify-end">
              <button
                onClick={handleRespond}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                disabled={sending}
              >
                {sending ? 'Envoi...' : 'Envoyer la réponse'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSupport; 