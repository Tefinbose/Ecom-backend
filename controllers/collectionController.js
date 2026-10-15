const collections = require("../models/collectionModel")

exports.addCollection = async (req, res) => {
    try {
        console.log("Inside add collection controller")

        const { title, description, handle, publishing, themeTemplate, seo, altText } = req.body
        const image = req.file ? { url: `/uploads/${req.file.filename}`, altText: altText || "" } : { url: "", altText: "" }

        const newCollection = await collections.create({ title, description, image, handle, publishing: publishing ? JSON.parse(publishing) : undefined, publishing: publishing ? JSON.parse(publishing) : undefined, themeTemplate, seo: seo ? JSON.parse(seo) : undefined })
        res.status(201).json({ message: "Collection added successfully", collection: newCollection })

    } catch (error) {
        res.status(500).json({ message: "Error adding collection", error: error.message })
    }
}

exports.getAllCollections = async (req, res) => {
    try {
        console.log("Inside get all collections controller")

        const allCollections = await collections.find()

        res.status(200).json({ message: "Collections fetched successfully", collections: allCollections })

    } catch (error) {
        res.status(500).json({ message: "Error fetching collections", error: error.message })
    }
}

exports.getSingleCollection = async (req, res) => {
    try {
        console.log("Inside get single collection controller")

        const { id } = req.params

        const collection = await collections.findById(id)

        if (!collection) {
            return res.status(404).json({ message: "Collection not found" })
        }

        res.status(200).json({ message: "Collection fetched successfully", collection })

    } catch (error) {
        res.status(500).json({ message: "Error fetching collection", error: error.message })
    }
}

exports.updateCollection = async (req, res) => {
    try {
        console.log("Inside update collection controller")

        const { id } = req.params
        const updateData = { ...req.body }

        const jsonFields = ["publishing", "seo"]

        for (const field of jsonFields) {
            if (typeof updateData[field] === "string") {
                updateData[field] = JSON.parse(updateData[field])
            }
        }

        const existingCollection = await collections.findById(id)

        if (!existingCollection) {
            return res.status(404).json({ message: "Collection not found" })
        }

        if (req.file) {
            updateData.image = { url: `/uploads/${req.file.filename}`, altText: updateData.altText || "" }
        }
        else if (updateData.altText !== undefined) {
            updateData.image = { ...existingCollection.image.toObject(), altText: updateData.altText }
        }

        delete updateData.altText

        const updatedCollection = await collections.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true })

        res.status(200).json({ message: "Collection updated successfully", collection: updatedCollection })

    } catch (error) {
        res.status(500).json({ message: "Error updating collection", error: error.message })
    }
}

exports.deleteCollection = async (req, res) => {
    try {
        console.log("Inside delete collection controller")

        const { id } = req.params

        const deletedCollection = await collections.findByIdAndDelete(id)

        if (!deletedCollection) {
            return res.status(404).json({ message: "Collection not found" })
        }

        res.status(200).json({ message: "Collection deleted successfully", collection: deletedCollection })

    } catch (error) {
        res.status(500).json({ message: "Error deleting collection", error: error.message })
    }
}