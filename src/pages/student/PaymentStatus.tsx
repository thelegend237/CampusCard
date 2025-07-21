import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Payment } from '../../types';
import { Download, Filter, Calendar, CreditCard, DollarSign, FileText } from 'lucide-react';

const PaymentStatus: React.FC = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);

  const handleApplyFilter = () => {
    let filtered = payments;
    if (filterStatus) {
      filtered = filtered.filter(p => p.status === filterStatus);
    }
    if (filterDate) {
      filtered = filtered.filter(p => new Date(p.created_at) >= new Date(filterDate));
    }
    setFilteredPayments(filtered);
  };

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
              {/* Filtrer Button with Dropdown */}
              <div className="relative">
                <button
                  className="flex items-center space-x-2 bg-gray-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-600 transition-colors"
                  onClick={() => setShowFilter((prev) => !prev)}
                >
                  <Filter className="w-4 h-4" />
                  <span>Filtrer</span>
                </button>
                {showFilter && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-10 p-4 text-gray-800">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleApplyFilter();
                        setShowFilter(false);
                      }}
                    >
                      <div className="mb-3">
                        <label className="block text-xs font-semibold mb-1">Statut</label>
                        <select
                          className="w-full border rounded px-2 py-1"
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                          title="Statut du paiement"
                        >
                          <option value="">Tous</option>
                          <option value="approved">Payé</option>
                          <option value="pending">En attente</option>
                          <option value="rejected">Rejeté</option>
                        </select>
                      </div>
                      <div className="mb-3">
                        <label className="block text-xs font-semibold mb-1">Date (après)</label>
                        <input
                          type="date"
                          className="w-full border rounded px-2 py-1"
                          value={filterDate}
                          onChange={(e) => setFilterDate(e.target.value)}
                          title="Date de filtre"
                          placeholder="Date (après)"
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <button
                          type="button"
                          className="text-gray-500 px-2 py-1 rounded hover:bg-gray-100"
                          onClick={() => {
                            setFilterStatus('');
                            setFilterDate('');
                            setShowFilter(false);
                            setFilteredPayments(payments);
                          }}
                        >
                          Réinitialiser
                        </button>
                        <button
                          type="submit"
                          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                        >
                          Appliquer
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
              {/* Exporter Button */}
              <button
                className="flex items-center space-x-2 bg-gray-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-600 transition-colors"
                onClick={async () => {
                  const { jsPDF } = await import('jspdf');
                  const doc = new jsPDF();
                  doc.setFontSize(18);
                  doc.text('Historique des Transactions', 20, 20);

                  let y = 35;
                  doc.setFontSize(12);
                  doc.text('Date', 20, y);
                  doc.text('Description', 50, y);
                  doc.text('Montant', 120, y);
                  doc.text('Statut', 160, y);

                  y += 8;
                  (filteredPayments.length ? filteredPayments : payments).forEach((payment) => {
                    if (y > 270) {
                      doc.addPage();
                      y = 20;
                    }
                    doc.text(
                      new Date(payment.created_at).toLocaleDateString('fr-FR'),
                      20,
                      y
                    );
                    doc.text(
                      String(payment.description),
                      50,
                      y
                    );
                    doc.text(
                      `${payment.amount.toLocaleString()} FCFA`,
                      120,
                      y
                    );
                    doc.text(
                      getStatusText(payment.status),
                      160,
                      y
                    );
                    y += 8;
                  });

                  doc.save('historique-transactions.pdf');
                }}
              >
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
                {(filteredPayments.length ? filteredPayments : payments).map((payment) => (
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
                      <button
                        className="text-blue-400 hover:text-blue-300 text-sm"
                        title="Télécharger le reçu"
                        onClick={async () => {
                          // Génération d'un reçu PDF simple pour le paiement
                          const { jsPDF } = await import('jspdf');
                          const doc = new jsPDF();

                          doc.setFontSize(18);
                          doc.text('Reçu de Paiement', 20, 20);

                          doc.setFontSize(12);
                          doc.text(`Description: ${payment.description}`, 20, 40);
                          doc.text(`Montant: ${payment.amount.toLocaleString()} FCFA`, 20, 50);
                          doc.text(`Statut: ${getStatusText(payment.status)}`, 20, 60);
                          doc.text(`Date: ${new Date(payment.created_at).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}`, 20, 70);
                          if (payment.paymentmethod) {
                            doc.text(`Méthode: ${payment.paymentmethod}`, 20, 80);
                          }
                          doc.text('Ce document atteste de votre paiement pour la carte étudiant.', 20, 100);

                          doc.save(`recu-paiement-${payment.id}.pdf`);
                        }}
                      >
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
              {(filteredPayments.length ? filteredPayments : payments).slice(0, 3).map((payment) => (
                <div key={payment.id} className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white">🧾</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{payment.description}</p>
                    <p className="text-xs text-gray-400">{new Date(payment.created_at).toLocaleDateString('fr-FR')}</p>
                    <p className="text-xs text-gray-300">Montant : {payment.amount.toLocaleString()} FCFA</p>
                  </div>
                  <button className="text-blue-400 hover:text-blue-300" title="Télécharger le reçu"
                    onClick={async () => {
                      const { jsPDF } = await import('jspdf');
                      const doc = new jsPDF();
                      doc.setFontSize(18);
                      doc.text('Reçu de Paiement', 20, 20);
                      doc.setFontSize(12);
                      doc.text(`Description: ${payment.description}`, 20, 40);
                      doc.text(`Montant: ${payment.amount.toLocaleString()} FCFA`, 20, 50);
                      doc.text(`Statut: ${getStatusText(payment.status)}`, 20, 60);
                      doc.text(`Date: ${new Date(payment.created_at).toLocaleDateString('fr-FR', {
                        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}`, 20, 70);
                      if (payment.paymentmethod) {
                        doc.text(`Méthode: ${payment.paymentmethod}`, 20, 80);
                      }
                      doc.text('Ce document atteste de votre paiement pour la carte étudiant.', 20, 100);
                      doc.save(`recu-paiement-${payment.id}.pdf`);
                    }}
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {(filteredPayments.length ? filteredPayments : payments).length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <p>Aucun reçu trouvé</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentStatus;