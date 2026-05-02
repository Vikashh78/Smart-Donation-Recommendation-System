export type UserRole = 'donor' | 'hospital';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isEmailVerified: boolean;
}

export interface Resource {
  id: string;
  item: string;
  quantity: number;
  location: string;
  expiryDate?: string;
  urgency?: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  status: 'pending' | 'matched' | 'completed';
}

export interface Match {
  id: string;
  donorId: string;
  hospitalId: string;
  resourceId: string;
  donorName: string;
  hospitalName: string;
  itemName: string;
  quantity: number;
  matchScore: number;
  status: 'pending' | 'approved' | 'declined';
}

export interface HospitalRequest {
  _id: string;
  hospital_email: string;
  item: string;
  quantity: number;
  urgency: string;
  location: string;
  deadline?: string;
  notes?: string;
  status: string;
  created_at?: string;
  match_count?: number;
}

export interface DonorMatch {
  donation_id: string;
  donor_email: string;
  item: string;
  quantity: number;
  location: string;
  expiry_date?: string;
  priority_score: number;
  estimated_delivery: string;
  response_rate: number;
}

export interface DonorNotification {
  _id: string;
  donor_email: string;
  hospital_email: string;
  request_id: string;
  item: string;
  quantity: number;
  urgency: string;
  deadline?: string;
  status: string;
  sent_at?: string;
  responded_at?: string;
  hospital_name?: string;
  request_details?: {
    item: string;
    quantity: number;
    urgency: string;
    deadline?: string;
    location: string;
  };
}
