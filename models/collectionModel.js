
const mongoose = require("mongoose")

const collectionImageSchema = new mongoose.Schema({
    url: {
        type: String,
        default: ""
    },
    altText: {
        type: String,
        default: ""
    }
}, { _id: false })

const publishingSchema = new mongoose.Schema({
    allChannels: {
        type: Boolean,
        default: false
    },
    salesChannels: {
        type: [String],
        default: []
    },
    publishedAt: {
        type: Date,
        default: null
    }
}, { _id: false })

const seoSchema = new mongoose.Schema({
    pageTitle: {
        type: String,
        default: ""
    },
    metaDescription: {
        type: String,
        default: ""
    },
    urlHandle: {
        type: String,
        default: ""
    }
}, { _id: false })

const collectionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ""
    },
    image: {
        type: collectionImageSchema,
        default: () => ({})
    },
    handle: {
        type: String,
        unique: true,
        trim: true
    },
    publishing: {
        type: publishingSchema,
        default: () => ({})
    },
    themeTemplate: {
        type: String,
        default: "Default collection"
    },
    seo: {
        type: seoSchema,
        default: () => ({})
    }
}, { timestamps: true })

collectionSchema.index({ title: 1 })

const collections = mongoose.model("collections", collectionSchema)
module.exports = collections
