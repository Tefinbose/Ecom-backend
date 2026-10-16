const inventory = require("../models/inventoryModel");
const products = require("../models/productModel");

/**
 * Fetch all inventory records.
 * Auto-syncs any missing inventory records for products and auto-heals stale variant IDs.
 */
exports.getAllInventory = async (req, res) => {
  try {
    console.log("Inside get all inventory controller");

    // 1. Check if all products have an inventory entry; auto-seed missing ones
    const allProducts = await products.find().select("title handle status variants unitPrice image");
    const existingInventories = await inventory.find();

    const existingProductIds = new Set(
      existingInventories.map((inv) => String(inv.product))
    );

    for (const prod of allProducts) {
      if (!existingProductIds.has(String(prod._id))) {
        const primaryVariant = prod.variants?.[0];
        const stockQty = primaryVariant?.inventoryQuantity ?? 0;
        await inventory.create({
          product: prod._id,
          variantId: primaryVariant?._id || null,
          sku: primaryVariant?.sku || "",
          locationName: "Main Warehouse",
          onHand: stockQty,
          available: stockQty,
          committed: 0,
          unavailable: 0,
          incoming: 0,
        }).catch(() => null);
      }
    }

    // 2. Fetch populated inventory documents
    const inventoryData = await inventory
      .find()
      .populate("product", "title handle status variants unitPrice image")
      .sort({ updatedAt: -1 });

    // 3. Auto-heal any stale variant IDs if product's variants changed
    for (const inv of inventoryData) {
      if (inv.product && Array.isArray(inv.product.variants) && inv.product.variants.length > 0) {
        const hasMatchingVariant = inv.variantId && inv.product.variants.some(
          (v) => String(v._id) === String(inv.variantId)
        );
        if (!hasMatchingVariant) {
          const fallbackVariant = inv.product.variants[0];
          inv.variantId = fallbackVariant._id;
          if (!inv.sku && fallbackVariant.sku) {
            inv.sku = fallbackVariant.sku;
          }
          await inventory.updateOne(
            { _id: inv._id },
            { $set: { variantId: fallbackVariant._id, ...(fallbackVariant.sku ? { sku: fallbackVariant.sku } : {}) } }
          );
        }
      }
    }

    res.status(200).json({
      message: "Inventory fetched successfully",
      inventory: inventoryData,
    });
  } catch (error) {
    console.error("Error fetching inventory:", error);
    res.status(500).json({
      message: "Error fetching inventory",
      error: error.message,
    });
  }
};

/**
 * Add a new inventory record with robust defaults and validation.
 */
exports.addInventory = async (req, res) => {
  try {
    console.log("Inside add inventory controller");

    const {
      product,
      variantId,
      sku,
      locationName = "Main Warehouse",
      unavailable = 0,
      committed = 0,
      onHand = 0,
      incoming = 0,
    } = req.body;

    if (!product) {
      return res.status(400).json({ message: "Product is required" });
    }

    const existingProduct = await products.findById(product);
    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Find or resolve variant
    let matchedVariant = null;
    if (variantId) {
      matchedVariant = existingProduct.variants.id(variantId);
    }
    if (!matchedVariant && existingProduct.variants?.length > 0) {
      matchedVariant = existingProduct.variants[0];
    }

    const numOnHand = Math.max(0, Number(onHand) || 0);
    const numCommitted = Math.max(0, Number(committed) || 0);
    const numUnavailable = Math.max(0, Number(unavailable) || 0);
    const numIncoming = Math.max(0, Number(incoming) || 0);
    const resolvedSku = (sku || matchedVariant?.sku || "").trim();

    const available = Math.max(0, numOnHand - numCommitted - numUnavailable);
    const finalVariantId = matchedVariant?._id || null;

    // Check if record already exists for this product & location
    const existingRecord = await inventory.findOne({
      product,
      variantId: finalVariantId,
      locationName,
    });

    if (existingRecord) {
      existingRecord.onHand = numOnHand;
      existingRecord.available = available;
      existingRecord.committed = numCommitted;
      existingRecord.unavailable = numUnavailable;
      existingRecord.incoming = numIncoming;
      if (resolvedSku) existingRecord.sku = resolvedSku;
      await existingRecord.save();
      await existingRecord.populate("product", "title handle status variants unitPrice image");

      if (matchedVariant) {
        matchedVariant.inventoryQuantity = available;
        if (resolvedSku) matchedVariant.sku = resolvedSku;
        await existingProduct.save();
      }

      return res.status(200).json({
        message: "Inventory updated successfully",
        inventory: existingRecord,
      });
    }

    const inventoryData = await inventory.create({
      product,
      variantId: finalVariantId,
      sku: resolvedSku,
      locationName,
      unavailable: numUnavailable,
      committed: numCommitted,
      available,
      onHand: numOnHand,
      incoming: numIncoming,
    });

    await inventoryData.populate("product", "title handle status variants unitPrice image");

    // Sync product variant stock
    if (matchedVariant) {
      matchedVariant.inventoryQuantity = available;
      if (resolvedSku && !matchedVariant.sku) matchedVariant.sku = resolvedSku;
      await existingProduct.save();
    }

    res.status(201).json({
      message: "Inventory added successfully",
      inventory: inventoryData,
    });
  } catch (error) {
    console.error("Error adding inventory:", error);
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Inventory record already exists for this product and location",
      });
    }
    res.status(500).json({
      message: "Error adding inventory",
      error: error.message,
    });
  }
};

/**
 * Update an existing inventory record.
 * Handles onHand, available, committed, unavailable, incoming, locationName, and sku.
 * Auto-syncs product stock and auto-heals stale variant references.
 */
exports.updateInventory = async (req, res) => {
  try {
    console.log("Inside update inventory controller");

    const { id } = req.params;
    const {
      locationName,
      unavailable,
      committed,
      onHand,
      available,
      incoming,
      sku,
    } = req.body;

    const existingInventory = await inventory.findById(id);
    if (!existingInventory) {
      return res.status(404).json({ message: "Inventory record not found" });
    }

    // Parse and sanitize quantities
    const numCommitted = committed !== undefined
      ? Math.max(0, Number(committed) || 0)
      : existingInventory.committed;

    const numUnavailable = unavailable !== undefined
      ? Math.max(0, Number(unavailable) || 0)
      : existingInventory.unavailable;

    const numIncoming = incoming !== undefined
      ? Math.max(0, Number(incoming) || 0)
      : existingInventory.incoming;

    let updatedOnHand;
    let calcAvailable;

    if (onHand !== undefined) {
      updatedOnHand = Math.max(0, Number(onHand) || 0);
      calcAvailable = Math.max(0, updatedOnHand - numCommitted - numUnavailable);
    } else if (available !== undefined) {
      calcAvailable = Math.max(0, Number(available) || 0);
      updatedOnHand = calcAvailable + numCommitted + numUnavailable;
    } else {
      updatedOnHand = existingInventory.onHand;
      calcAvailable = Math.max(0, updatedOnHand - numCommitted - numUnavailable);
    }

    // Sync with product and resolve variant
    const existingProduct = await products.findById(existingInventory.product);
    if (existingProduct) {
      let matchedVariant = null;

      // 1. Try finding by saved variantId
      if (existingInventory.variantId) {
        matchedVariant = existingProduct.variants.id(existingInventory.variantId);
      }

      // 2. If variant was re-saved and got a new _id, fallback to first variant (auto-heal)
      if (!matchedVariant && existingProduct.variants?.length > 0) {
        matchedVariant = existingProduct.variants[0];
        existingInventory.variantId = matchedVariant._id;
      }

      if (matchedVariant) {
        matchedVariant.inventoryQuantity = calcAvailable;
        if (sku) matchedVariant.sku = sku.trim();
        await existingProduct.save();
      }
    }

    // Save inventory document
    existingInventory.onHand = updatedOnHand;
    existingInventory.available = calcAvailable;
    existingInventory.committed = numCommitted;
    existingInventory.unavailable = numUnavailable;
    existingInventory.incoming = numIncoming;

    if (locationName) existingInventory.locationName = locationName.trim();
    if (sku) existingInventory.sku = sku.trim();

    await existingInventory.save();
    await existingInventory.populate("product", "title handle status variants unitPrice image");

    res.status(200).json({
      message: "Inventory updated successfully",
      inventory: existingInventory,
    });
  } catch (error) {
    console.error("Error updating inventory:", error);
    res.status(500).json({
      message: "Error updating inventory",
      error: error.message,
    });
  }
};

/**
 * Delete an inventory record.
 */
exports.deleteInventory = async (req, res) => {
  try {
    console.log("Inside delete inventory controller");

    const { id } = req.params;
    const deletedInventory = await inventory.findByIdAndDelete(id);

    if (!deletedInventory) {
      return res.status(404).json({ message: "Inventory record not found" });
    }

    res.status(200).json({
      message: "Inventory deleted successfully",
      inventory: deletedInventory,
    });
  } catch (error) {
    console.error("Error deleting inventory:", error);
    res.status(500).json({
      message: "Error deleting inventory",
      error: error.message,
    });
  }
};
