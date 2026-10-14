const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");

const { createOrderController, getAllOrdersController, getOrderByIdController, updateOrderStatusController, searchOrdersController,getOrderStatsController } = require("../controllers/orderController");
    
router.use(authMiddleware);
router.post("/", createOrderController);
router.get("/search", searchOrdersController);
router.get("/stats", getOrderStatsController);

router.get("/", getAllOrdersController);
router.get("/:id", getOrderByIdController);
router.patch("/:id/status", updateOrderStatusController);

module.exports = router;