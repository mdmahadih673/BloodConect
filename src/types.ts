export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'O+' | 'O-' | 'AB+' | 'AB-';

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  bloodGroup: BloodGroup;
  area: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  lastDonationDate?: string;
  availability: boolean;
  role: 'donor' | 'admin';
  isBanned: boolean;
  createdAt: string;
}

export interface BloodRequest {
  _id: string;
  requesterId: string | User;
  donorId: string | User;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
