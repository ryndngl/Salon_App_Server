import mongoose from "mongoose";
const { Schema, model } = mongoose;

const favoriteSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number },
  image: { type: String },
  service: {
    name: { type: String, required: true },
    _id: { type: String }
  },
  addedAt: { type: Date, default: Date.now }
}, { _id: true });

const userSchema = new Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  favorites: [favoriteSchema]
},{
  timestamps: true,
});

const User = mongoose.models.User || model("User", userSchema);
export default User;