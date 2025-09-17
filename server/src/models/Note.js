import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    content: { type: String, default: '' },
    tags: { type: [String], default: [], index: true },
  },
  { timestamps: true }
);

noteSchema.index({ title: 'text', content: 'text', tags: 'text' });

export default mongoose.model('Note', noteSchema);
