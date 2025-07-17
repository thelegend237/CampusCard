import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Payment } from '../../types';
import { Download, Filter, Calendar, CreditCard, DollarSign, FileText } from 'lucide-react';

const PaymentStatus: React.FC = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchPayments = async () => {
    if (!user) return;
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('userid', user.id)
        .order('created_at', { ascending: false });
      if (!error) setPayments(data || []);
      setLoading(false);
    };
    fetchPayments();
  }, [user]);

  const montantDu = 5000; // Peut être calculé dynamiquement si besoin
  const dernierPaiement = payments[0];
  const statut = dernierPaiement?.status || 'pending';

  const detailsFrais = [
    { label: "Carte d'étudiant", montant: 4000 },
    { label: "Frais administratifs", montant: 1000 },
    { label: "Taxes", montant: 0 },
  ];
  const totalFrais = detailsFrais.reduce((sum, f) => sum + f.montant, 0);

  const methodesPaiement = [
    { value: 'momo', label: 'Paiement mobile rapide et sécurisé', frais: '1%' },
    { value: 'transfert', label: "Transfert d'argent mobile", frais: '1.5%' },
    { value: 'virement', label: 'Virement bancaire', frais: '2%' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Payé';
      case 'pending':
        return 'En attente';
      case 'rejected':
        return 'Rejeté';
      default:
        return 'Inconnu';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">État du paiement</h1>
            <p className="text-blue-100">Récapitulatif de votre paiement pour la carte d'étudiant</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-100">Montant dû:</p>
            <p className="text-2xl font-bold">{montantDu.toLocaleString()} FCFA</p>
            <p className="text-sm text-blue-100">Date limite: 30/06/2025</p>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(statut)}`}>
              {getStatusText(statut)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transactions History */}
        <div className="lg:col-span-2 bg-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Historique des transactions</h2>
            <div className="flex space-x-2">
              <button className="flex items-center space-x-2 bg-gray-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-600 transition-colors">
                <Filter className="w-4 h-4" />
                <span>Filtrer</span>
              </button>
              <button className="flex items-center space-x-2 bg-gray-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-600 transition-colors">
                <Download className="w-4 h-4" />
                <span>Exporter</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400 text-sm">
                  <th className="pb-3 font-medium">DATE</th>
                  <th className="pb-3 font-medium">DESCRIPTION</th>
                  <th className="pb-3 font-medium">MONTANT</th>
                  <th className="pb-3 font-medium">STATUT</th>
                  <th className="pb-3 font-medium">REÇU</th>
                </tr>
              </thead>
              <tbody className="text-white">
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-t border-gray-700">
                    <td className="py-4 text-sm">
                      {new Date(payment.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="py-4 text-sm">{payment.description}</td>
                    <td className="py-4 text-sm font-medium">
                      {payment.amount.toLocaleString()} FCFA
                    </td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                        {getStatusText(payment.status)}
                      </span>
                    </td>
                    <td className="py-4">
                      <button className="text-blue-400 hover:text-blue-300 text-sm">
                        <Download className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {payments.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <p>Aucune transaction trouvée</p>
            </div>
          )}

          <div className="flex items-center justify-between mt-6 text-sm text-gray-400">
            <p>Affichage de {payments.length} transactions sur {payments.length}</p>
            <div className="flex items-center space-x-2">
              <button className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center hover:bg-gray-600 transition-colors">
                ←
              </button>
              <span className="bg-blue-600 text-white w-8 h-8 rounded flex items-center justify-center">
                1
              </span>
              <button className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center hover:bg-gray-600 transition-colors">
                →
              </button>
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="space-y-6">
          {/* Fee Breakdown */}
          <div className="bg-gray-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Détails des frais</h3>
            
            <div className="space-y-3">
              {detailsFrais.map((f, index) => (
                <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-white" />
                  </div>
                    <span className="text-white">{f.label}</span>
                  </div>
                  <span className="text-white font-medium">{f.montant.toLocaleString()} FCFA</span>
                </div>
              ))}

              <div className="border-t border-gray-700 pt-3">
                <div className="flex items-center justify-between text-lg font-bold">
                  <span className="text-white">Total</span>
                  <span className="text-white">{totalFrais.toLocaleString()} FCFA</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white rounded-2xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Méthodes de paiement</h3>
            
            <div className="space-y-3">
              {methodesPaiement.map((method, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 border-2 border-blue-500 rounded-lg bg-blue-50">
                <input 
                  type="radio" 
                    id={method.value} 
                  name="payment" 
                  className="text-blue-600" 
                    defaultChecked={index === 0} // Set default checked for the first method
                />
                <div className="flex-1">
                    <label htmlFor={method.value} className="block text-sm font-medium text-gray-900">
                      {method.label}
                  </label>
                    <p className="text-xs text-gray-500">Frais: {method.frais}</p>
              </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Receipts */}
          <div className="bg-gray-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Reçus récents</h3>
            
            <div className="space-y-3">
              {[
                { title: 'Facture - Frais d\'inscription', date: '02/06/2025', icon: '📄' },
                { title: 'Reçu - Frais de dossier', date: '15/05/2025', icon: '🧾' },
                { title: 'Récapitulatif des paiements', date: '09/06/2025', icon: '📊' }
              ].map((receipt, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white">{receipt.icon}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{receipt.title}</p>
                    <p className="text-xs text-gray-400">{receipt.date}</p>
                  </div>
                  <button className="text-blue-400 hover:text-blue-300">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentStatus;