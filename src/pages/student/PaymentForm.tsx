import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

const PaymentForm: React.FC<{ amount: number; cardid?: string; onSuccess?: () => void }> = ({ amount, cardid, onSuccess }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [method, setMethod] = useState<'card' | 'mtn' | 'orange'>('card');
  const [form, setForm] = useState({
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvc: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (method === 'card' && (!form.cardName || !form.cardNumber || !form.expiry || !form.cvc)) {
      setError('Tous les champs carte sont obligatoires.');
      return;
    }
    if ((method === 'mtn' || method === 'orange') && !form.phone) {
      setError('Le numéro de téléphone est obligatoire.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from('payments').insert([
        {
          userid: user?.id,
          cardid: cardid || null,
          amount,
          description: 'Frais de carte étudiant',
          status: 'pending',
          paymentmethod: method,
          transactionid: Math.random().toString(36).substring(2, 12),
          phone: (method === 'mtn' || method === 'orange') ? form.phone : null,
          created_at: new Date().toISOString(),
        },
      ]);
      if (error) throw error;
      if (onSuccess) onSuccess();
      navigate('/dashboard/payment-status');
    } catch (err: any) {
      setError(err.message || 'Erreur lors du paiement.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800 p-6 rounded-2xl max-w-md mx-auto">
      <h2 className="text-xl font-bold text-white mb-4">Paiement des frais</h2>
      {error && <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-2">{error}</div>}
      <div>
        <label className="block text-sm text-gray-300 mb-1">Méthode de paiement</label>
        <select
          value={method}
          onChange={e => setMethod(e.target.value as 'card' | 'mtn' | 'orange')}
          className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600"
        >
          <option value="card">Carte bancaire</option>
          <option value="mtn">Mobile Money MTN</option>
          <option value="orange">Mobile Money ORANGE</option>
        </select>
      </div>
      {method === 'card' && (
        <>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Nom sur la carte</label>
            <input type="text" name="cardName" value={form.cardName} onChange={handleChange} className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600" required={method === 'card'} />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Numéro de carte</label>
            <input type="text" name="cardNumber" value={form.cardNumber} onChange={handleChange} className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600" required={method === 'card'} maxLength={19} />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm text-gray-300 mb-1">Expiration</label>
              <input type="text" name="expiry" value={form.expiry} onChange={handleChange} className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600" placeholder="MM/AA" required={method === 'card'} maxLength={5} />
            </div>
            <div className="flex-1">
              <label className="block text-sm text-gray-300 mb-1">CVC</label>
              <input type="text" name="cvc" value={form.cvc} onChange={handleChange} className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600" required={method === 'card'} maxLength={4} />
            </div>
          </div>
        </>
      )}
      {(method === 'mtn' || method === 'orange') && (
        <div>
          <label className="block text-sm text-gray-300 mb-1">Numéro de téléphone Mobile Money</label>
          <input type="tel" name="phone" value={form.phone} onChange={handleChange} className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600" required={method === 'mtn' || method === 'orange'} maxLength={15} />
        </div>
      )}
      <div className="text-white font-semibold">Montant à payer : {amount.toLocaleString()} FCFA</div>
      <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
        {loading ? 'Paiement en cours...' : 'Valider le paiement'}
      </button>
    </form>
  );
};

export default PaymentForm; 