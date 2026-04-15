import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  bloodGroup: { 
    type: String, 
    required: true, 
    enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] 
  },
  area: { type: String, required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [lng, lat]
  },
  lastDonationDate: { type: Date },
  availability: { type: Boolean, default: true },
  role: { type: String, enum: ['donor', 'admin'], default: 'donor' },
  isBanned: { type: Boolean, default: false }
}, { timestamps: true });

userSchema.index({ location: '2dsphere' });

export const User = mongoose.models.User || mongoose.model('User', userSchema);

const requestSchema = new mongoose.Schema({
  requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' }
}, { timestamps: true });

export const BloodRequest = mongoose.models.BloodRequest || mongoose.model('BloodRequest', requestSchema);
