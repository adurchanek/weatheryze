import mongoose from "mongoose";

const FavoriteLocationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  id: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  countryCode: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    default: null,
  },
  stateCode: {
    type: String,
    default: null,
  },
  zip: {
    type: String,
    default: null,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("FavoriteLocation", FavoriteLocationSchema);
