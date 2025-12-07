import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  timezone: {
    type: String,
    required: true
  },
  startDateTime: {
    type: String,
    required: true
  },
  endDateTime: {
    type: String,
    required: true
  },
  profileIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile'
  }],
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

const Event = mongoose.model('Event', eventSchema);

export default Event;
