import mongoose from 'mongoose';

const favoriteCitySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true },
    country: { type: String },
    lat: { type: Number },
    lon: { type: Number },
  },
  { timestamps: true }
);

favoriteCitySchema.index({ user: 1, name: 1, country: 1 }, { unique: true, sparse: true });

export default mongoose.model('FavoriteCity', favoriteCitySchema);
