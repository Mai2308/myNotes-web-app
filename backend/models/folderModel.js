import mongoose from 'mongoose';
const { Schema } = mongoose;

const FolderSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // owner field matches noteModel's `user`
  name: { type: String, required: true, trim: true },
  parentId: { type: Schema.Types.ObjectId, ref: 'Folder', default: null },
  isDefault: { type: Boolean, default: false }, // true for system folders like Favorites
  isProtected: { type: Boolean, default: false },
  passwordHash: { type: String, default: null },
}, { timestamps: true });

export default mongoose.model('Folder', FolderSchema);