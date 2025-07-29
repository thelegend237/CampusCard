import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User, Notification, Program, Department } from '../types';
import { Search, Plus, Edit, Trash2, Eye, Mail, X, Key, RefreshCw, Download } from 'lucide-react';
import { createStudentAccount, updateStudentAccount, changeStudentPassword, resetStudentPassword, checkMatriculeExists } from '../lib/matriculeAuth';

const AdminStudents: React.FC = () => {
  const [students, setStudents] = useState<User[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  
  // State for modals
  const [modal, setModal] = useState<'add' | 'edit' | 'view' | 'password' | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({});
  const [passwordData, setPasswordData] = useState({ password: '', confirmPassword: '' });

  // State for notification modal
  const [notifModalOpen, setNotifModalOpen] = useState(false);
  const [notifForm, setNotifForm] = useState<{ title: string; message: string; type: Notification['type'] }>({ title: '', message: '', type: 'info' });
  const [notifLoading, setNotifLoading] = useState(false);

  // State for form validation
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchStudents();
    fetchPrograms();
    fetchDepartments();
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

  const fetchPrograms = async () => {
    try {
      const { data, error } = await supabase
        .from('programs')
        .select(`
          *,
          department:departments(name, code)
        `)
        .order('name');

      if (error) throw error;
      console.log('Programmes chargés:', data);
      setPrograms(data || []);
    } catch (error) {
      console.error('Error fetching programs:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('name');

      if (error) throw error;
      console.log('Départements chargés:', data);
      setDepartments(data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  // Fonction pour filtrer les programmes par département
  const getProgramsByDepartment = (departmentName: string) => {
    console.log('Recherche programmes pour département:', departmentName);
    console.log('Programmes disponibles:', programs);
    const filtered = programs.filter(program => 
      program.department?.name === departmentName
    );
    console.log('Programmes filtrés:', filtered);
    return filtered;
  };

  // Fonction pour obtenir le nom du programme par son ID
  const getProgramNameById = (programId: string) => {
    const program = programs.find(p => p.id === programId);
    return program ? program.name : programId;
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      (student.firstname || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.lastname || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.studentid || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.matricule || '').toLowerCase().includes(searchTerm.toLowerCase());
    
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

  const openModal = (type: 'add' | 'edit' | 'view' | 'password', student?: User) => {
    setModal(type);
    setFormErrors({});
    if (student) {
      setSelectedStudent(student);
      setFormData(student);
    } else {
      setSelectedStudent(null);
      setFormData({ role: 'student' });
    }
    if (type === 'password') {
      setPasswordData({ password: '', confirmPassword: '' });
    }
  };

  const closeModal = () => {
    setModal(null);
    setSelectedStudent(null);
    setFormData({});
    setPasswordData({ password: '', confirmPassword: '' });
    setFormErrors({});
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!formData.firstname?.trim()) errors.firstname = 'Le prénom est requis';
    if (!formData.lastname?.trim()) errors.lastname = 'Le nom est requis';
    if (!formData.email?.trim()) errors.email = 'L\'email est requis';
    if (!formData.matricule?.trim()) errors.matricule = 'Le matricule est requis';
    if (!formData.department?.trim()) errors.department = 'Le département est requis';
    if (!formData.program?.trim()) errors.program = 'Le programme est requis';

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.email = 'Format d\'email invalide';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePasswordForm = () => {
    const errors: { [key: string]: string } = {};

    if (!passwordData.password) errors.password = 'Le mot de passe est requis';
    if (passwordData.password.length < 6) errors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    if (passwordData.password !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Vérifier si le matricule existe déjà
      const matriculeExists = await checkMatriculeExists(formData.matricule!);
      if (matriculeExists) {
        setFormErrors({ matricule: 'Ce matricule existe déjà' });
        return;
      }

      // Générer un mot de passe temporaire (matricule + année)
      const currentYear = new Date().getFullYear();
      const tempPassword = `${formData.matricule}${currentYear}`;

      const result = await createStudentAccount({
        matricule: formData.matricule!,
        firstname: formData.firstname!,
        lastname: formData.lastname!,
        email: formData.email!,
        department: formData.department!,
        program: formData.program!,
        password: tempPassword,
        phone: formData.phone,
        studentid: formData.studentid,
        dateofbirth: formData.dateofbirth,
        placeofbirth: formData.placeofbirth,
        avatar: formData.avatar,
      });

      if (result.success) {
        alert(`Étudiant créé avec succès !\n\nVous pouvez maintenant voir le mot de passe temporaire en cliquant sur l'icône "Voir" à côté de l'étudiant dans le tableau.`);
      closeModal();
      fetchStudents();
      } else {
        alert(`Erreur: ${result.error}`);
      }
    } catch (error) {
      console.error('Error creating student:', error);
      alert('Erreur lors de la création de l\'étudiant');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !selectedStudent) return;

    setIsSubmitting(true);
    try {
      const result = await updateStudentAccount(selectedStudent.id, {
        matricule: formData.matricule,
        firstname: formData.firstname,
        lastname: formData.lastname,
        email: formData.email,
        department: formData.department,
        program: formData.program,
        phone: formData.phone,
        studentid: formData.studentid,
        dateofbirth: formData.dateofbirth,
        placeofbirth: formData.placeofbirth,
        avatar: formData.avatar,
      });

      if (result.success) {
        alert('Étudiant mis à jour avec succès');
      closeModal();
      fetchStudents();
      } else {
        alert(`Erreur: ${result.error}`);
      }
    } catch (error) {
      console.error('Error updating student:', error);
      alert('Erreur lors de la mise à jour');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePasswordForm() || !selectedStudent) return;

    setIsSubmitting(true);
    try {
      const result = await changeStudentPassword(selectedStudent.id, passwordData.password);
      
      if (result.success) {
        alert('Mot de passe changé avec succès');
        closeModal();
      } else {
        alert(`Erreur: ${result.error}`);
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Erreur lors du changement de mot de passe');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (student: User) => {
    if (!confirm(`Réinitialiser le mot de passe de ${student.firstname} ${student.lastname} ?`)) return;

    try {
      // Générer un nouveau mot de passe temporaire
      const currentYear = new Date().getFullYear();
      const tempPassword = `${student.matricule}${currentYear}`;

      const result = await resetStudentPassword(student.matricule!, tempPassword);
      
      if (result.success) {
        alert(`Mot de passe réinitialisé !\nNouveau mot de passe temporaire: ${tempPassword}\n\nL'étudiant devra changer son mot de passe à la prochaine connexion.`);
      } else {
        alert(`Erreur: ${result.error}`);
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      alert('Erreur lors de la réinitialisation du mot de passe');
    }
  };

  // Fonction pour exporter les étudiants en CSV
  const exportStudentsToCSV = () => {
    // En-têtes du CSV
    const headers = [
      'N°',
      'MATRICULE',
      'NOMS & PRENOMS',
      'PASSWORD',
      'Date de naissance',
      'lieu',
      'Filliere',
      'sigle',
      'Niveau',
      'Email',
      'Téléphone',
      'ID étudiant',
      'Avatar'
    ];

    // Données des étudiants
    const csvData = students.map((student, index) => [
      index + 1,
      student.matricule || '',
      `${student.lastname} ${student.firstname}`,
      student.password_plain || 'Mot de passe modifié',
      student.dateofbirth ? new Date(student.dateofbirth).toLocaleDateString('fr-FR') : '',
      student.placeofbirth || '',
      student.department || '',
      getProgramNameById(student.program || '') || '',
      'licence', // Niveau par défaut
      student.email || '',
      student.phone || '',
      student.studentid || '',
      student.avatar || ''
    ]);

    // Créer le contenu CSV
    const csvContent = [
      headers.join(';'),
      ...csvData.map(row => row.join(';'))
    ].join('\n');

    // Créer et télécharger le fichier
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `etudiants_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Fonction pour exporter les étudiants filtrés en CSV
  const exportFilteredStudentsToCSV = () => {
    // En-têtes du CSV
    const headers = [
      'N°',
      'MATRICULE',
      'NOMS & PRENOMS',
      'PASSWORD',
      'Date de naissance',
      'lieu',
      'Filliere',
      'sigle',
      'Niveau',
      'Email',
      'Téléphone',
      'ID étudiant',
      'Avatar'
    ];

    // Données des étudiants filtrés
    const csvData = filteredStudents.map((student, index) => [
      index + 1,
      student.matricule || '',
      `${student.lastname} ${student.firstname}`,
      student.password_plain || 'Mot de passe modifié',
      student.dateofbirth ? new Date(student.dateofbirth).toLocaleDateString('fr-FR') : '',
      student.placeofbirth || '',
      student.department || '',
      getProgramNameById(student.program || '') || '',
      'licence', // Niveau par défaut
      student.email || '',
      student.phone || '',
      student.studentid || '',
      student.avatar || ''
    ]);

    // Créer le contenu CSV
    const csvContent = [
      headers.join(';'),
      ...csvData.map(row => row.join(';'))
    ].join('\n');

    // Créer et télécharger le fichier
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `etudiants_filtres_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          <div className="flex items-center space-x-3">
            <button
              onClick={exportStudentsToCSV}
              className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
              title="Exporter tous les étudiants en CSV"
            >
              <Download className="w-5 h-5" />
              <span>Exporter CSV</span>
            </button>
          <button
            onClick={() => openModal('add')}
            className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Ajouter un étudiant</span>
          </button>
          </div>
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
            {departments.map(department => (
              <option key={department.id} value={department.name}>{department.name}</option>
            ))}
          </select>

          <button
            onClick={exportFilteredStudentsToCSV}
            disabled={filteredStudents.length === 0}
            className="bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            title={`Exporter ${filteredStudents.length} étudiant(s) filtré(s) en CSV`}
          >
            <Download className="w-4 h-4" />
            <span>Exporter ({filteredStudents.length})</span>
          </button>
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
                  Matricule
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Département
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut mot de passe
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
                          Matricule: {student.matricule || 'Non défini'}
                        </div>
                        {student.studentid && (
                          <div className="text-xs text-gray-400">
                            ID: {student.studentid}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{student.email}</div>
                    <div className="text-sm text-gray-500">{student.phone || 'Non renseigné'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{student.matricule || 'Non défini'}</div>
                    {student.studentid && (
                      <div className="text-xs text-gray-500">ID: {student.studentid}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{student.department}</div>
                    <div className="text-sm text-gray-500">{getProgramNameById(student.program || '')}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      student.password_changed 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {student.password_changed ? 'Modifié' : 'Temporaire'}
                    </span>
                    {!student.password_changed && student.password_plain && (
                      <div className="text-xs text-gray-500 mt-1">
                        Mot de passe visible
                      </div>
                    )}
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
                      {/* Changer le mot de passe */}
                      <button
                        className="text-yellow-600 hover:text-yellow-500"
                        title="Changer le mot de passe"
                        onClick={() => openModal('password', student)}
                        type="button"
                      >
                        <Key className="w-4 h-4" />
                      </button>
                      {/* Réinitialiser le mot de passe */}
                      <button
                        className="text-red-600 hover:text-red-500"
                        title="Réinitialiser le mot de passe"
                        onClick={() => handleResetPassword(student)}
                        type="button"
                      >
                        <RefreshCw className="w-4 h-4" />
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
                {modal === 'password' && 'Changer le mot de passe'}
              </h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-800" aria-label="Fermer la modale">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* View Mode */}
            {modal === 'view' && selectedStudent && (
              <div className="space-y-6">
                {/* Informations personnelles */}
                <div>
                  <h3 className="text-lg font-semibold text-blue-700 mb-3 border-b border-gray-200 pb-2">
                    Informations personnelles
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Prénom</label>
                      <p className="text-gray-900 font-medium">{selectedStudent.firstname || 'Non renseigné'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Nom</label>
                      <p className="text-gray-900 font-medium">{selectedStudent.lastname || 'Non renseigné'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Date de naissance</label>
                      <p className="text-gray-900">{selectedStudent.dateofbirth || 'Non renseignée'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Lieu de naissance</label>
                      <p className="text-gray-900">{selectedStudent.placeofbirth || 'Non renseigné'}</p>
                    </div>
                  </div>
                </div>

                {/* Informations académiques */}
                <div>
                  <h3 className="text-lg font-semibold text-blue-700 mb-3 border-b border-gray-200 pb-2">
                    Informations académiques
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Matricule</label>
                      <p className="text-gray-900 font-mono bg-gray-50 px-2 py-1 rounded text-sm">{selectedStudent.matricule || 'Non défini'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">ID étudiant</label>
                      <p className="text-gray-900">{selectedStudent.studentid || 'Non défini'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Département</label>
                      <p className="text-gray-900 font-medium">{selectedStudent.department || 'Non renseigné'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Programme</label>
                      <p className="text-gray-900">{getProgramNameById(selectedStudent.program || '') || 'Non renseigné'}</p>
                    </div>
                  </div>
                </div>

                {/* Informations de contact */}
                <div>
                  <h3 className="text-lg font-semibold text-blue-700 mb-3 border-b border-gray-200 pb-2">
                    Informations de contact
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                      <p className="text-gray-900 break-all">{selectedStudent.email || 'Non renseigné'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Téléphone</label>
                      <p className="text-gray-900">{selectedStudent.phone || 'Non renseigné'}</p>
                    </div>
                  </div>
                </div>

                {/* Informations système */}
                <div>
                  <h3 className="text-lg font-semibold text-blue-700 mb-3 border-b border-gray-200 pb-2">
                    Informations système
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Rôle</label>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedStudent.role === 'admin' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {selectedStudent.role === 'admin' ? 'Administrateur' : 'Étudiant'}
                      </span>
                    </div>
                                         <div>
                       <label className="block text-sm font-medium text-gray-600 mb-1">Statut du mot de passe</label>
                       <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                         selectedStudent.password_changed 
                           ? 'bg-green-100 text-green-800' 
                           : 'bg-yellow-100 text-yellow-800'
                       }`}>
                         {selectedStudent.password_changed ? 'Modifié' : 'Temporaire'}
                       </span>
                     </div>
                     {!selectedStudent.password_changed && selectedStudent.password_plain && (
                       <div>
                         <label className="block text-sm font-medium text-gray-600 mb-1">Mot de passe temporaire</label>
                         <div className="flex items-center space-x-2">
                           <p className="text-gray-900 font-mono bg-yellow-50 px-2 py-1 rounded text-sm border border-yellow-200">
                             {selectedStudent.password_plain}
                           </p>
                           <button
                             onClick={() => {
                               navigator.clipboard.writeText(selectedStudent.password_plain!);
                               alert('Mot de passe copié dans le presse-papiers !');
                             }}
                             className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                             title="Copier le mot de passe"
                           >
                             📋
                           </button>
                         </div>
                       </div>
                     )}
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Date de création</label>
                      <p className="text-gray-900 text-sm">
                        {selectedStudent.created_at ? new Date(selectedStudent.created_at).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'Non disponible'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Dernière modification</label>
                      <p className="text-gray-900 text-sm">
                        {selectedStudent.updated_at ? new Date(selectedStudent.updated_at).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'Non disponible'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* ID système (caché par défaut) */}
                <div>
                  <details className="group">
                    <summary className="cursor-pointer text-sm font-medium text-gray-500 hover:text-gray-700">
                      ID système (cliquer pour afficher)
                    </summary>
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs font-mono text-gray-600 break-all">{selectedStudent.id}</p>
                    </div>
                  </details>
                </div>
              </div>
            )}

            {/* Add/Edit Mode */}
            {(modal === 'add' || modal === 'edit') && (
              <form onSubmit={modal === 'add' ? handleCreateStudent : handleUpdateStudent} className="space-y-6">
                {/* Informations personnelles */}
                <div>
                  <h3 className="text-lg font-semibold text-blue-700 mb-3 border-b border-gray-200 pb-2">Informations personnelles</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Prénom *</label>
                      <input type="text" name="firstname" value={formData.firstname || ''} onChange={handleFormChange} className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 px-4 py-2 transition" placeholder="Prénom de l'étudiant" required />
                      {formErrors.firstname && <p className="text-red-500 text-xs mt-1">{formErrors.firstname}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Nom *</label>
                      <input type="text" name="lastname" value={formData.lastname || ''} onChange={handleFormChange} className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 px-4 py-2 transition" placeholder="Nom de l'étudiant" required />
                      {formErrors.lastname && <p className="text-red-500 text-xs mt-1">{formErrors.lastname}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Date de naissance</label>
                      <input type="date" name="dateofbirth" value={formData.dateofbirth || ''} onChange={handleFormChange} className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 px-4 py-2 transition" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Lieu de naissance</label>
                      <input type="text" name="placeofbirth" value={formData.placeofbirth || ''} onChange={handleFormChange} className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 px-4 py-2 transition" placeholder="Ville de naissance" />
                    </div>
                                          <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">URL de l'avatar</label>
                        <input type="url" name="avatar" value={formData.avatar || ''} onChange={handleFormChange} className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 px-4 py-2 transition" placeholder="https://example.com/avatar.jpg" title="URL de l'image de profil" />
                    </div>
                  </div>
                </div>

                {/* Informations académiques */}
                <div>
                  <h3 className="text-lg font-semibold text-blue-700 mb-3 border-b border-gray-200 pb-2">Informations académiques</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Matricule *</label>
                      <input type="text" name="matricule" value={formData.matricule || ''} onChange={handleFormChange} className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 px-4 py-2 transition" placeholder="Matricule unique" required />
                      {formErrors.matricule && <p className="text-red-500 text-xs mt-1">{formErrors.matricule}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">ID étudiant</label>
                      <input type="text" name="studentid" value={formData.studentid || ''} onChange={handleFormChange} className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 px-4 py-2 transition" placeholder="ID étudiant (optionnel)" />
                    </div>
                                          <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Département *</label>
                        <select name="department" value={formData.department || ''} onChange={handleFormChange} className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 px-4 py-2 transition" required title="Sélectionner le département de l'étudiant">
                          <option value="">Sélectionnez un département</option>
                          {departments.length > 0 ? (
                            departments.map(department => (
                              <option key={department.id} value={department.name}>{department.name}</option>
                            ))
                          ) : (
                            <option value="" disabled>Chargement des départements...</option>
                          )}
                        </select>
                        {formErrors.department && <p className="text-red-500 text-xs mt-1">{formErrors.department}</p>}
                      </div>
                                          <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Programme *</label>
                        <select name="program" value={formData.program || ''} onChange={handleFormChange} className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 px-4 py-2 transition" required title="Sélectionner le programme de l'étudiant">
                          <option value="">Sélectionnez un programme</option>
                          {formData.department ? (
                            getProgramsByDepartment(formData.department).length > 0 ? (
                              getProgramsByDepartment(formData.department).map(program => (
                                <option key={program.id} value={program.id}>{program.name} ({program.level})</option>
                              ))
                            ) : (
                              <option value="" disabled>Aucun programme trouvé pour ce département</option>
                            )
                          ) : (
                            <option value="" disabled>Sélectionnez d'abord un département</option>
                          )}
                        </select>
                        {formErrors.program && <p className="text-red-500 text-xs mt-1">{formErrors.program}</p>}
                      </div>
                  </div>
                </div>

                {/* Informations de contact */}
                <div>
                  <h3 className="text-lg font-semibold text-blue-700 mb-3 border-b border-gray-200 pb-2">Informations de contact</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Email *</label>
                      <input type="email" name="email" value={formData.email || ''} onChange={handleFormChange} className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 px-4 py-2 transition" placeholder="adresse@email.com" required />
                      {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Téléphone</label>
                      <input type="tel" name="phone" value={formData.phone || ''} onChange={handleFormChange} className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 px-4 py-2 transition" placeholder="Numéro de téléphone" />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-4 pt-6">
                  <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold transition" disabled={isSubmitting}>Annuler</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow transition" disabled={isSubmitting}>
                    {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            )}

            {/* Password Change Mode */}
            {modal === 'password' && selectedStudent && (
              <form onSubmit={handleChangePassword} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Nouveau mot de passe</label>
                    <input type="password" name="password" value={passwordData.password} onChange={handlePasswordChange} className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 px-4 py-2 transition" placeholder="Nouveau mot de passe" />
                    {formErrors.password && <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Confirmer le nouveau mot de passe</label>
                    <input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 px-4 py-2 transition" placeholder="Confirmer le nouveau mot de passe" />
                    {formErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{formErrors.confirmPassword}</p>}
                  </div>
                </div>
                <div className="flex justify-end space-x-4 pt-6">
                  <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold transition" disabled={isSubmitting}>Annuler</button>
                  <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold shadow transition" disabled={isSubmitting}>
                    {isSubmitting ? 'Changement...' : 'Changer le mot de passe'}
                  </button>
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