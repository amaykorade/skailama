import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  timezone: {
    type: String,
    required: true,
    default: 'UTC'
  },
  createdAt: {
    type: String,
    required: true
  },
  updatedAt: {
    type: String,
    required: true
  }
}, {
  timestamps: false
});

const Profile = mongoose.model('Profile', profileSchema);

export default Profile;
