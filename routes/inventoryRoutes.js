const express = require("express")
const authMiddleware = require("../middlewares/authMiddleware")
const roleMiddleware = require("../middlewares/roleMidlleware")
const { addInventory, getAllInventory, updateInventory, deleteInventory } = require("../controllers/inventoryController")
const router = express.Router()

router.post("/add", authMiddleware, roleMiddleware("admin"), addInventory)

router.get("/", authMiddleware, roleMiddleware("admin"), getAllInventory)

router.patch("/:id", authMiddleware, roleMiddleware("admin"), updateInventory)

router.delete("/:id", authMiddleware, roleMiddleware("admin"), deleteInventory)

module.exports = router