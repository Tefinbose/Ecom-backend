const mongoose = require("mongoose")

const unitPriceSchema = new mongoose.Schema({
    amount: {
        type: Number,
        default: null,
        min: 0
    },
    measurementUnit: {
        type: String,
        default: ""
    }
}, { _id: false })

const mediaSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true
    },
    altText: {
        type: String,
        default: ""
    },
    mediaContentType: {
        type: String,
        enum: ["IMAGE", "VIDEO", "MODEL_3D", "EXTERNAL_VIDEO"],
        default: "IMAGE"
    },
    width: {
        type: Number,
        default: null,
        min: 0
    },
    height: {
        type: Number,
        default: null,
        min: 0
    },
    position: {
        type: Number,
        default: 1,
        min: 1
    }

})

const inventoryLocationSchema = new mongoose.Schema({
    locationName: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        default: 0,
        min: 0
    },
    available: {
        type: Number,
        default: 0,
        min: 0
    },
    onHand: {
        type: Number,
        default: 0,
        min: 0
    },
    committed: {
        type: Number,
        default: 0,
        min: 0
    },
    incoming: {
        type: Number,
        default: 0,
        min: 0
    }
})

const selectedOptionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    value: {
        type: String,
        required: true
    }
}, { _id: false })

const variantSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    compareAtPrice: {
        type: Number,
        default: null,
        min: 0
    },
    costPerItem: {
        type: Number,
        default: 0,
        min: 0
    },
    sku: {
        type: String,
        default: ""
    },
    barcode: {
        type: String,
        default: ""
    },
    inventoryQuantity: {
        type: Number,
        default: 0,
        min: 0
    },
    inventoryTracked: {
        type: Boolean,
        default: true
    },
    continueSellingOutOfStock: {
        type: Boolean,
        default: false
    },
    requiresShipping: {
        type: Boolean,
        default: true
    },
    chargeTax: {
        type: Boolean,
        default: true
    },
    weight: {
        type: Number,
        default: 0,
        min: 0
    },
    weightUnit: {
        type: String,
        enum: ["kg", "g", "lb", "oz"],
        default: "kg"
    },
    image: {
        type: String,
        default: ""
    },
    position: {
        type: Number,
        default: 1,
        min: 1
    },
    selectedOptions: {
        type: [selectedOptionSchema],
        default: []
    }
})

const optionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    position: {
        type: Number,
        default: 1,
        min: 1
    },
    values: {
        type: [String],
        default: []
    }
})

const packageDimensionsSchema = new mongoose.Schema({
    length: {
        type: Number,
        default: 0,
        min: 0
    },
    width: {
        type: Number,
        default: 0,
        min: 0
    },
    height: {
        type: Number,
        default: 0,
        min: 0
    },
    unit: {
        type: String,
        enum: ["cm", "in"],
        default: "cm"
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

const metafieldSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true
    },
    value: {
        type: String,
        required: true
    },
    namespace: {
        type: String,
        default: "custom"
    },
    type: {
        type: String,
        default: "single_line_text_field"
    },
    description: {
        type: String,
        default: ""
    }
})

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        enum: ["active", "draft", "archived", "unlisted"],
        default: "active"
    },
    handle: {
        type: String,
        unique: true,
        trim: true
    },
    category: {
        type: String,
        default: ""
    },
    productType: {
        type: String,
        default: ""
    },
    vendor: {
        type: String,
        default: ""
    },
    Collection: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Collection"
    }],
    tags: {
        type: [String],
        default: []
    },
    themeTemplate: {
        type: String,
        default: "Default Product"
    },
    image: {
        type: String,
        default: ""
    },
    media: {
        type: [mediaSchema],
        default: []
    },
    unitPrice: {
        type: unitPriceSchema,
        default: () => ({})
    },
    inventoryTracked: {
        type: Boolean,
        default: true
    },
    inventoryLocations: {
        type: [inventoryLocationSchema],
        default: []
    },
    hasVariants: {
        type: Boolean,
        default: false
    },
    options: {
        type: [optionSchema],
        default: []
    },
    variants: {
        type: [variantSchema],
        default: []
    },
    isPhysicalProduct: {
        type: Boolean,
        default: true
    },
    packageType: {
        type: String,
        default: "Store default"
    },
    packageDimensions: {
        type: packageDimensionsSchema,
        default: () => ({})
    },
    countryOfOrigin: {
        type: String,
        default: ""
    },
    hsCode: {
        type: String,
        default: ""
    },
    publishing: {
        type: publishingSchema,
        default: () => ({})
    },
    seo: {
        type: seoSchema,
        default: () => ({})
    },
    metafields: {
        type: [metafieldSchema],
        default: []
    },
    isGiftCard: {
        type: Boolean,
        default: false
    },
    publishedAt: {
        type: Date,
        default: null
    }
}, { timestamps: true })

productSchema.index({ title: 1 })
productSchema.index({ status: 1 })
productSchema.index({ vendor: 1 })
productSchema.index({ collections: 1 })

const products = mongoose.model("products", productSchema)
module.exports = products