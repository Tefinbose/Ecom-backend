const express = require("express")
const authMiddleware = require("../middlewares/authMiddleware")
const roleMiddleware = require("../middlewares/roleMiddleware")
const multerMiddleware = require("../middlewares/multerMiddleware")
const { addProduct, getAllProducts, getSingleProduct, updateProduct, deleteProduct } = require("../controllers/productController")
const router = express.Router()

router.post("/add", authMiddleware, roleMiddleware("admin"), multerMiddleware.array("images"), addProduct)

router.get("/", authMiddleware, roleMiddleware("admin"), getAllProducts)

router.get("/:id", authMiddleware, roleMiddleware("admin"), getSingleProduct)

router.patch("/:id", authMiddleware, roleMiddleware("admin"), multerMiddleware.array("images"), updateProduct)

router.delete("/:id", authMiddleware, roleMiddleware("admin"), deleteProduct)

module.exports = router