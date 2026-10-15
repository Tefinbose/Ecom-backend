const express = require("express")
const authMiddleware = require("../middlewares/authMiddleware")
const roleMiddleware = require("../middlewares/roleMidlleware")
const { addCollection, getAllCollections, getSingleCollection, updateCollection, deleteCollection } = require("../controllers/collectionController")
const multerMiddleware = require("../middlewares/multerMiddleware")
const router = express.Router()

router.post("/add", authMiddleware, roleMiddleware("admin"), multerMiddleware.single("image"), addCollection)

router.get("/", authMiddleware, roleMiddleware("admin"), getAllCollections)

router.get("/:id", authMiddleware, roleMiddleware("admin"), getSingleCollection)

router.patch("/:id", authMiddleware, roleMiddleware("admin"), multerMiddleware.single("image"), updateCollection)

router.delete("/:id", authMiddleware, roleMiddleware("admin"), deleteCollection)

module.exports = router