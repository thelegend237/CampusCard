export interface User {
  id: string;
  email: string;
  role: 'student' | 'admin';
  firstname: string;
  lastname: string;
  studentid?: string;
  department?: string;
  program?: string;
  avatar?: string;
  phone?: string;
  dateofbirth?: string;
  placeofbirth?: string;
  matricule?: string; // Nouveau : matricule unique pour l'authentification
  password_hash?: string; // Nouveau : hash du mot de passe
  password_changed?: boolean; // Nouveau : si le mot de passe a été changé depuis la création
  password_plain?: string; // Nouveau : mot de passe en clair temporaire (pour l'admin)
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  programs: string[];
  created_at: string;
}

export interface Program {
  id: string;
  name: string;
  code: string;
  department_id: string;
  level: 'DUT' | 'BTS' | 'Licence' | 'Master' | 'Doctorat';
  duration: number;
  description?: string;
  created_at: string;
  updated_at: string;
  department?: Department; // Pour les jointures
}

export interface Card {
  id: string;
  userid: string;
  studentid: string;
  firstname: string;
  lastname: string;
  department: string;
  program: string;
  avatar?: string;
  issueddate: string;
  expirydate: string;
  status: 'pending' | 'approved' | 'rejected';
  qrcode?: string;
  created_at: string;
  updated_at: string;
  users: User; // For joins
}

export interface Payment {
  id: string;
  userid: string;
  cardid?: string;
  amount: number;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  paymentmethod?: string;
  transactionid?: string;
  created_at: string;
  updated_at: string;
  users: User; // For joins
}

export interface Notification {
  id: string;
  userid: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  created_at: string;
}

export interface SupportMessage {
  id: string;
  userid?: string;
  fullname: string;
  email: string;
  category: 'technical' | 'payment' | 'card' | 'account' | 'general' | 'urgent' | 'bug' | 'feature';
  message: string;
  response?: string;
  status?: string; // Valeur par défaut 'pending' dans la base de données
  created_at?: string; // Généré automatiquement par la base de données
  answered_at?: string;
  subject?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical'; // Valeur par défaut 'medium' dans la base de données
  assigned_to?: string;
  tags?: string[];
  resolved_at?: string;
  closed_at?: string;
  estimated_resolution_time?: string;
  actual_resolution_time?: string;
  satisfaction_rating?: number; // Entre 1 et 5
  internal_notes?: string;
} 