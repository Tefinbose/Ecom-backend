const products = require("../models/productModel")

exports.addProduct = async (req, res) => {

    try {

        console.log("Inside add product controller")

        const {
            title,
            description,
            status,
            handle,
            category,
            productType,
            vendor,
            Collection,
            tags,
            themeTemplate,
            unitPrice,
            inventoryTracked,
            inventoryLocations,
            hasVariants,
            options,
            variants,
            isPhysicalProduct,
            packageType,
            packageDimensions,
            countryOfOrigin,
            hsCode,
            publishing,
            seo,
            metafields,
            isGiftCard,
            publishedAt
        } = req.body

        if (!title) {
            return res.status(400).json({ message: "Product title is required" })
        }

        const uploadedImages = req.files.map(item => item.filename)
        console.log("Uploaded images:", uploadedImages)

        const jsonFields = {
            Collection,
            tags,
            unitPrice,
            inventoryLocations,
            options,
            variants,
            packageDimensions,
            publishing,
            seo,
            metafields
        }

        for (const [field, value] of Object.entries(jsonFields)) {
            if (value !== undefined && typeof value === "string") {
                try {
                    jsonFields[field] = JSON.parse(value)
                } catch {
                    return res.status(400).json({ message: `Invalid JSON format for ${field}` })
                }
            }
        }

        if (handle) {
            const existingProduct = await products.findOne({ handle })

            if (existingProduct) {
                return res.status(409).json({
                    message: "Product already exists"
                })
            }
        }

        const newProduct = await products.create({
            title,
            description,
            status,
            handle,
            category,
            productType,
            vendor,
            Collection: jsonFields.Collection,
            tags: jsonFields.tags,
            themeTemplate,
            image: uploadedImages[0] || "",
            media: uploadedImages.map((filename, index) => ({
                url: `/uploads/${filename}`,
                altText: "",
                mediaContentType: "IMAGE",
                position: index + 1
            })),
            unitPrice: jsonFields.unitPrice,
            inventoryTracked,
            inventoryLocations: jsonFields.inventoryLocations,
            hasVariants,
            options: jsonFields.options,
            variants: jsonFields.variants,
            isPhysicalProduct,
            packageType,
            packageDimensions: jsonFields.packageDimensions,
            countryOfOrigin,
            hsCode,
            publishing: jsonFields.publishing,
            seo: jsonFields.seo,
            metafields: jsonFields.metafields,
            isGiftCard,
            publishedAt
        })

        return res.status(201).json({ message: "Product added successfully", product: newProduct })

    } catch (error) {
        console.error("Add product error:", error)
        return res.status(500).json({ message: "Failed to add product", error: error.message })
    }
}

exports.getAllProducts = async (req, res) => {
    try {
        console.log("Inside get all products controller")

        const allProducts = await products.find()

        res.status(200).json({ message: "Products fetched successfully", products: allProducts })

    } catch (error) {
        res.status(500).json({ message: "Error fetching products", error: error.message })
    }
}

exports.getSingleProduct = async (req, res) => {
    try {
        console.log("Inside get single product controller")
        const { id } = req.params
        const product = await products.findById(id)
        if (!product) {
            return res.status(404).json({ message: "Product not found" })
        }

        res.status(200).json({ message: "Product fetched successfully", product: product })

    } catch (error) {
        res.status(500).json({ message: "Error fetching product", error: error.message })
    }
}

exports.updateProduct = async (req, res) => {

    try {
        console.log("Inside update product controller")

        const { id } = req.params
        const updateData = { ...req.body }

        const jsonFields = [
            "Collection",
            "tags",
            "unitPrice",
            "inventoryLocations",
            "options",
            "variants",
            "packageDimensions",
            "publishing",
            "seo",
            "metafields"
        ]

        for (const field of jsonFields) {
            if (typeof updateData[field] === "string") {
                updateData[field] = JSON.parse(updateData[field])
            }
        }

        const existingProduct = await products.findById(id)

        if (!existingProduct) {
            return res.status(404).json({ message: "Product not found" })
        }

        const updateQuery = { $set: updateData }

        if (req.files && req.files.length > 0) {
            const uploadedImages = req.files.map(
                (file) => file.filename
            )

            const newMedia = uploadedImages.map((filename, index) => ({
                url: `/uploads/${filename}`,
                altText: "",
                mediaContentType: "IMAGE",
                position: existingProduct.media.length + index + 1
            }))

            updateQuery.$push = { media: { $each: newMedia } }

            if (!existingProduct.image) {
                updateQuery.$set.image = uploadedImages[0]
            }
        }

        const updatedProduct = await products.findByIdAndUpdate(id, updateQuery, { new: true, runValidators: true })

        res.status(200).json({ message: "Product updated successfully", product: updatedProduct })

    }
    catch (error) {
        res.status(500).json({ message: "Error updating product", error: error.message })
    }
}

exports.deleteProduct = async (req, res) => {
    try {
        console.log("Inside delete product controller")

        const { id } = req.params
        const deletedProduct = await products.findByIdAndDelete(id)
        if (!deletedProduct) {
            return res.status(404).json({ message: "Product not found" })
        }

        res.status(200).json({ message: "Product deleted succesfully", product: deletedProduct })

    } catch (error) {
        res.status(500).json({ message: "Error deleting product", error: error.message })
    }
}
