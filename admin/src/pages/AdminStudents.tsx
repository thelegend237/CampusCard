import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User, Notification } from '../types';
import { Search, Plus, Edit, Trash2, Eye, Mail, X } from 'lucide-react';

const AdminStudents: React.FC = () => {
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  
  // State for modals
  const [modal, setModal] = useState<'add' | 'edit' | 'view' | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({});

  // State for notification modal
  const [notifModalOpen, setNotifModalOpen] = useState(false);
  const [notifForm, setNotifForm] = useState<{ title: string; message: string; type: Notification['type'] }>({ title: '', message: '', type: 'info' });
  const [notifLoading, setNotifLoading] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'student')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      (student.firstname || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.lastname || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.studentid || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = filterDepartment === '' || student.department === filterDepartment;
    
    return matchesSearch && matchesDepartment;
  });

  const handleDeleteStudent = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet étudiant ?')) {
      try {
        const { error } = await supabase
          .from('users')
          .delete()
          .eq('id', id);

        if (error) throw error;
        fetchStudents();
      } catch (error) {
        console.error('Error deleting student:', error);
      }
    }
  };

  const handleSendMail = (student: User) => {
    if (student.email) {
      window.location.href = `mailto:${student.email}`;
    } else {
      alert("Cet étudiant n'a pas d'adresse e-mail.");
    }
  };

  const openModal = (type: 'add' | 'edit' | 'view', student?: User) => {
    setModal(type);
    if (student) {
      setSelectedStudent(student);
      setFormData(student);
    } else {
      setSelectedStudent(null);
      setFormData({ role: 'student' });
    }
  };

  const closeModal = () => {
    setModal(null);
    setSelectedStudent(null);
    setFormData({});
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    // IMPORTANT: Creating a user like this only adds them to the 'users' table,
    // but not to Supabase Auth. They will not be able to log in.
    // For a full solution, you should create a Supabase Edge Function to securely
    // invite a user or create an auth user using the admin key.
    const { error } = await supabase.from('users').insert([formData]);
    if (error) {
      alert('Erreur lors de la création de l\'étudiant.');
      console.error(error);
    } else {
      alert('Étudiant ajouté avec succès (profil uniquement, pas de connexion possible).');
      closeModal();
      fetchStudents();
    }
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    const { error } = await supabase
      .from('users')
      .update(formData)
      .eq('id', selectedStudent.id);
    if (error) {
      alert('Erreur lors de la mise à jour.');
      console.error(error);
    } else {
      alert('Étudiant mis à jour avec succès.');
      closeModal();
      fetchStudents();
    }
  };

  const openNotifModal = (student: User) => {
    setSelectedStudent(student);
    setNotifForm({ title: '', message: '', type: 'info' });
    setNotifModalOpen(true);
  };
  const closeNotifModal = () => {
    setNotifModalOpen(false);
    setNotifForm({ title: '', message: '', type: 'info' });
    setSelectedStudent(null);
  };
  const handleNotifFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNotifForm(prev => ({ ...prev, [name]: value }));
  };
  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setNotifLoading(true);
    const { error } = await supabase.from('notifications').insert([
      {
        userid: selectedStudent.id,
        title: notifForm.title,
        message: notifForm.message,
        type: notifForm.type,
      }
    ]);
    setNotifLoading(false);
    if (error) {
      alert('Erreur lors de l\'envoi de la notification.');
      console.error(error);
    } else {
      alert('Notification envoyée avec succès !');
      closeNotifModal();
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
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Gestion des étudiants</h1>
            <p className="text-blue-100">Gérez les comptes étudiants et leurs informations</p>
          </div>
          <button
            onClick={() => openModal('add')}
            className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Ajouter un étudiant</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher par nom, email ou ID étudiant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            title="Filtrer par département"
          >
            <option value="">Tous les départements</option>
            <option value="Informatique & Réseaux">Informatique & Réseaux</option>
            <option value="Génie Civil">Génie Civil</option>
            <option value="Électronique">Électronique</option>
            <option value="Maintenance Industrielle">Maintenance Industrielle</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Étudiant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Département
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date d'inscription
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {(student.firstname || '')[0] || ''}
                          {(student.lastname || '')[0] || ''}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {student.firstname} {student.lastname}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {student.studentid}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{student.email}</div>
                    <div className="text-sm text-gray-500">{student.phone || 'Non renseigné'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{student.department}</div>
                    <div className="text-sm text-gray-500">{student.program}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(student.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {/* Voir détails étudiant */}
                      <button
                        className="text-blue-600 hover:text-blue-500"
                        title="Voir"
                        onClick={() => openModal('view', student)}
                        type="button"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {/* Modifier étudiant */}
                      <button
                        className="text-green-600 hover:text-green-500"
                        title="Modifier"
                        onClick={() => openModal('edit', student)}
                        type="button"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {/* Envoyer un email */}
                      <button
                        className="text-gray-600 hover:text-gray-500"
                        title="Envoyer un email"
                        onClick={() => handleSendMail(student)}
                        type="button"
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                      {/* Envoyer une notification */}
                      <button
                        className="text-purple-600 hover:text-purple-500"
                        title="Notifier"
                        onClick={() => openNotifModal(student)}
                        type="button"
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                      {/* Supprimer étudiant */}
                      <button
                        onClick={() => handleDeleteStudent(student.id)}
                        className="text-red-600 hover:text-red-500"
                        title="Supprimer"
                        type="button"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredStudents.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>Aucun étudiant trouvé</p>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total étudiants</h3>
          <p className="text-3xl font-bold text-blue-600">{students.length}</p>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Nouveaux ce mois</h3>
          <p className="text-3xl font-bold text-green-600">
            {students.filter(s => {
              const created = new Date(s.created_at);
              const now = new Date();
              return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
            }).length}
          </p>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Départements actifs</h3>
          <p className="text-3xl font-bold text-purple-600">
            {new Set(students.map(s => s.department).filter(Boolean)).size}
          </p>
        </div>
      </div>

      {/* Modals */}
      {modal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {modal === 'add' && 'Ajouter un étudiant'}
                {modal === 'edit' && 'Modifier l\'étudiant'}
                {modal === 'view' && 'Détails de l\'étudiant'}
              </h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-800" aria-label="Fermer la modale">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* View Mode */}
            {modal === 'view' && selectedStudent && (
              <div className="space-y-4">
                {Object.entries(selectedStudent).map(([key, value]) => (
                  <div key={key}>
                    <p className="text-sm font-semibold text-gray-600">{key}</p>
                    <p className="text-gray-800">{String(value)}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Add/Edit Mode */}
            {(modal === 'add' || modal === 'edit') && (
              <form onSubmit={modal === 'add' ? handleCreateStudent : handleUpdateStudent} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Informations de base */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-blue-700 mb-2">Informations de base</h3>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Prénom</label>
                      <input type="text" name="firstname" value={formData.firstname || ''} onChange={handleFormChange} className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 px-4 py-2 transition" placeholder="Prénom de l'étudiant" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Nom</label>
                      <input type="text" name="lastname" value={formData.lastname || ''} onChange={handleFormChange} className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 px-4 py-2 transition" placeholder="Nom de l'étudiant" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Département</label>
                      <input type="text" name="department" value={formData.department || ''} onChange={handleFormChange} className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 px-4 py-2 transition" placeholder="Département" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Programme</label>
                      <input type="text" name="program" value={formData.program || ''} onChange={handleFormChange} className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 px-4 py-2 transition" placeholder="Programme d'études" />
                    </div>
                  </div>
                  {/* Contact */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-blue-700 mb-2">Contact</h3>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                      <input type="email" name="email" value={formData.email || ''} onChange={handleFormChange} className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 px-4 py-2 transition" placeholder="adresse@email.com" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Téléphone</label>
                      <input type="text" name="phone" value={formData.phone || ''} onChange={handleFormChange} className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 px-4 py-2 transition" placeholder="Numéro de téléphone" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">ID étudiant</label>
                      <input type="text" name="studentid" value={formData.studentid || ''} onChange={handleFormChange} className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 px-4 py-2 transition" placeholder="Matricule" />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-4 pt-6">
                  <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold transition">Annuler</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow transition">Enregistrer</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Notification Modal */}
      {notifModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Envoyer une notification</h2>
              <button onClick={closeNotifModal} className="text-gray-500 hover:text-gray-800" aria-label="Fermer la modale">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSendNotification} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Destinataire</label>
                <div className="font-semibold text-blue-700">{selectedStudent.firstname} {selectedStudent.lastname} ({selectedStudent.email})</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                <input type="text" name="title" value={notifForm.title} onChange={handleNotifFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required title="Titre de la notification" placeholder="Titre de la notification" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea name="message" value={notifForm.message} onChange={handleNotifFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" rows={4} required title="Message de la notification" placeholder="Message à envoyer" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select name="type" value={notifForm.type} onChange={handleNotifFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" title="Type de notification">
                  <option value="info">Info</option>
                  <option value="success">Succès</option>
                  <option value="warning">Avertissement</option>
                  <option value="error">Erreur</option>
                </select>
              </div>
              <div className="flex justify-end pt-4">
                <button type="button" onClick={closeNotifModal} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold transition mr-2">Annuler</button>
                <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold shadow transition" disabled={notifLoading}>
                  {notifLoading ? 'Envoi...' : 'Envoyer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStudents;