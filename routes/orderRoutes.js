const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");

const { createOrderController, getAllOrdersController, getOrderByIdController, updateOrderStatusController, searchOrdersController,getOrderStatsController } = require("../controllers/orderController");
    
router.use(authMiddleware);
const roleMiddleware = require("../middlewares/roleMiddleware");
router.post("/", roleMiddleware("admin"), createOrderController);
router.get("/search", roleMiddleware("admin"), searchOrdersController);
router.get("/stats", roleMiddleware("admin"), getOrderStatsController);

router.get("/", roleMiddleware("admin"), getAllOrdersController);
router.get("/:id", roleMiddleware("admin"), getOrderByIdController);
router.patch("/:id/status", roleMiddleware("admin"), updateOrderStatusController);

module.exports = router;