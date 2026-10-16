const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "products",
      required: true,
    },
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    sku: {
      type: String,
      default: "",
      trim: true,
    },
    locationName: {
      type: String,
      required: true,
      trim: true,
      default: "Main Warehouse",
    },
    unavailable: {
      type: Number,
      default: 0,
      min: 0,
    },
    committed: {
      type: Number,
      default: 0,
      min: 0,
    },
    available: {
      type: Number,
      default: 0,
      min: 0,
    },
    onHand: {
      type: Number,
      default: 0,
      min: 0,
    },
    incoming: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

inventorySchema.index(
  { product: 1, variantId: 1, locationName: 1 },
  { unique: true }
);

const inventory = mongoose.model("inventory", inventorySchema);
module.exports = inventory;
