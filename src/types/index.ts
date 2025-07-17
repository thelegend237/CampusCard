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
  created_at: string;
  updated_at?: string;
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
  qrCode?: string;
  created_at: string;
  updated_at?: string;
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
  updated_at?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  programs: string[];
  created_at: string;
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