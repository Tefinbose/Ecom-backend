const inventory = require("../models/inventoryModel")
const products = require("../models/productModel")

exports.getAllInventory = async (req, res) => {
    try {
        console.log("Inside get all inventory controller")

        const inventoryData = await inventory.find().populate("product", "title handle status variants")

        res.status(200).json({ message: "Inventory fetched successfully", inventory: inventoryData })

    } catch (error) {
        res.status(500).json({ message: "Error fetching inventory", error: error.message })
    }
}

exports.addInventory = async (req, res) => {
    try {
        console.log("Inside add inventory controller")

        const { product, variantId, locationName, unavailable, committed, onHand, incoming } = req.body

        if (!product || !locationName || onHand === undefined || committed === undefined || unavailable === undefined) {
            return res.status(400).json({ message: "Product, locationName, onHand, committed, and unavailable are required" })
        }

        const existingProduct = await products.findById(product)
        if (!existingProduct) {
            return res.status(404).json({ message: "Product not found" })
        }

        if (variantId) {
            const existingVariant = existingProduct.variants.id(variantId)
            if (!existingVariant) {
                return res.status(404).json({ message: "Variant not found for this product" })
            }
        }

        const quantities = { onHand, committed, unavailable, incoming: incoming ?? 0 }

        for (const [field, value] of Object.entries(quantities)) {
            if (
                typeof value !== "number" ||
                !Number.isFinite(value) ||
                value < 0
            ) {
                return res.status(400).json({ message: `${field} must be a non-negative number` })
            }
        }

        if (committed + unavailable > onHand) {
            return res.status(400).json({ message: "Committed and unavailable stock cannot exceed on-hand stock" })
        }

        const existingInventory = await inventory.findOne({ product, variantId: variantId || null, locationName })
        if (existingInventory) {
            return res.status(409).json({ message: "Inventory already exists for this product and location" })
        }

        const available = Math.max(0, (onHand || 0) - (committed || 0) - (unavailable || 0))

        const inventoryData = await inventory.create({ product, variantId: variantId || null, locationName, unavailable, committed, available, onHand, incoming })

        res.status(201).json({ message: "Inventory added successfully", inventory: inventoryData })

    } catch (error) {

        if (error.code === 11000) {
            return res.status(409).json({ message: "Inventory already exists for this product and location" })
        }

        res.status(500).json({ message: "Error adding inventory", error: error.message })
    }
}

exports.updateInventory = async (req, res) => {
    try {
        console.log("Inside update inventory controller")

        const { id } = req.params
        const { locationName, unavailable, committed, onHand, incoming } = req.body


        const quantities = { unavailable, committed, onHand, incoming }

        for (const [field, value] of Object.entries(quantities)) {
            if (value === undefined) continue

            if (
                typeof value !== "number" ||
                !Number.isFinite(value) ||
                value < 0
            ) {
                return res.status(400).json({ message: `${field} must be a non-negative number` })
            }
        }

        const existingInventory = await inventory.findById(id)

        if (!existingInventory) {
            return res.status(404).json({ message: "Inventory not found" })
        }


        const existingProduct = await products.findById(existingInventory.product)

        if (!existingProduct) {
            return res.status(404).json({ message: "Product linked to this inventory was not found" })
        }

        if (existingInventory.variantId) {
            const existingVariant = existingProduct.variants.id(
                existingInventory.variantId
            )

            if (!existingVariant) {
                return res.status(404).json({ message: "Variant linked to this inventory was not found" })
            }
        }

        const updatedOnHand = onHand ?? existingInventory.onHand
        const updatedCommitted = committed ?? existingInventory.committed
        const updatedUnavailable = unavailable ?? existingInventory.unavailable

        if (updatedCommitted + updatedUnavailable > updatedOnHand) {
            return res.status(400).json({ message: "Committed and unavailable stock cannot exceed on-hand stock" })
        }

        const available = Math.max(0, updatedOnHand - updatedCommitted - updatedUnavailable)

        const updatedInventory = await inventory.findByIdAndUpdate(
            id,
            {
                $set: {
                    ...(locationName !== undefined && { locationName }),
                    ...(unavailable !== undefined && { unavailable }),
                    ...(committed !== undefined && { committed }),
                    ...(onHand !== undefined && { onHand }),
                    ...(incoming !== undefined && { incoming }),
                    available
                }
            },
            { new: true, runValidators: true }
        )

        res.status(200).json({ message: "Inventory updated successfully", inventory: updatedInventory })

    } catch (error) {

        if (error.code === 11000) {
            return res.status(409).json({ message: "Inventory already exists for this product and location" })
        }

        res.status(500).json({ message: "Error updating inventory", error: error.message })
    }
}

exports.deleteInventory = async (req, res) => {
    try {
        console.log("Inside delete inventory controller")

        const { id } = req.params

        const deletedInventory = await inventory.findByIdAndDelete(id)

        if (!deletedInventory) {
            return res.status(404).json({ message: "Inventory not found" })
        }

        res.status(200).json({ message: "Inventory deleted successfully", inventory: deletedInventory })

    } catch (error) {
        res.status(500).json({ message: "Error deleting inventory", error: error.message })
    }
}
