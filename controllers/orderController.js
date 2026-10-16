
const orders = require("../models/orderModel");

exports.createOrderController = async (req, res) => {
    try {
        const { orderNumber, customerName, customerEmail, items, status } = req.body;
        if (!orderNumber || !customerName || !customerEmail || !items) {
            return res.status(400).json({ message: "All Fields are Required" })
        }
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: "Order must contain at least one item" });
        }
        const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailReg.test(customerEmail)) {
            return res.status(400).json({ message: "Invalid Email" });
        }
        for (const item of items) {
            if (
                !Number.isInteger(item.quantity) ||
                item.quantity < 1 ||
                typeof item.price !== "number" ||
                !Number.isFinite(item.price) ||
                item.price < 0
            ) {
                return res.status(400).json({
                    message: "Invalid item data"
                });
            }
        }
        let totalAmount = 0;
        for (const item of items) {
            totalAmount += item.quantity * item.price;
        }
        console.log("Recieved Order Data:", req.body);
        const newOrder = new orders({ orderNumber, customerName, customerEmail, items, totalAmount, ...(status ? { status } : {}) });
        await newOrder.save();
        res.status(201).json({ message: "Order created Successfully", order: newOrder })
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ message: "Failed to Create Order", error: error.message })
    }
}
exports.getAllOrdersController = async (req, res) => {
    try {
        const allOrders = await orders.find();
        res.status(200).json({ message: "All Orders fetched Successfully", orders: allOrders });

    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ message: "Failed to fetch Orders", error: error.message });
    }
};
exports.getOrderByIdController = async (req, res) => {
    try {
        const { id } = req.params;
        if (!/^[0-9a-fA-F]{24}$/.test(id)) {
            return res.status(400).json({
                message: "Invalid Order ID"
            });
        }

        const order = await orders.findById(id);

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        res.status(200).json({ message: "Order fetched Successfully", order });

    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch order",
            error: error.message
        });
    }
};
exports.searchOrdersController = async (req, res) => {
    try {
        const { search, status } = req.query;
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(
            100,
            Math.max(1, Number(req.query.limit) || 10)
        );
        const skip = (page - 1) * limit;


        const validStatuses = [
            "pending",
            "processing",
            "shipped",
            "delivered",
            "cancelled"
        ];

        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid Order Status"
            });
        }

        const filter = {};

        if (search) {
            filter.$or = [
                {
                    customerName: {
                        $regex: search,
                        $options: "i"
                    }
                },
                {
                    orderNumber: {
                        $regex: search,
                        $options: "i"
                    }
                }
            ];
        }

        if (status) {
            filter.status = status;
        }

        const allOrders = await orders
            .find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalOrders = await orders.countDocuments(filter);
        const totalPages = Math.ceil(totalOrders / limit);

        return res.status(200).json({
            message: "Orders fetched successfully",
            currentPage: page,
            totalPages,
            totalOrders,
            orders: allOrders
        });

    } catch (error) {
        console.error("Error searching orders:", error);

        return res.status(500).json({
            message: "Failed to search orders",
            error: error.message
        });
    }
};
exports.updateOrderStatusController = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!/^[0-9a-fA-F]{24}$/.test(id)) {
            return res.status(400).json({
                message: "Invalid Order ID"
            });
        }

        const validStatuses = [
            "pending",
            "processing",
            "shipped",
            "delivered",
            "cancelled"
        ];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid Order Status"
            });
        }

        const updatedOrder = await orders.findByIdAndUpdate(
            id,
            { status },
            { new: true } // Updated document return ചെയ്യാൻ
        )
        if (!updatedOrder) {
            return res.status(404).json({
                message: "Order not found"
            });
        }
        res.status(200).json({ message: "Order status updated Successfully", order: updatedOrder });

    } catch (error) {
        return res.status(500).json({
            message: "Failed to update order status",
            error: error.message
        });
    }
};
exports.getOrderStatsController = async (req, res) => {
    try {
        const totalOrders = await orders.countDocuments();
        const pendingOrders = await orders.countDocuments({
            status: "pending"
        });

        const processingOrders = await orders.countDocuments({
            status: "processing"
        });

        const deliveredOrders = await orders.countDocuments({
            status: "delivered"
        });
        const cancelledOrders = await orders.countDocuments({
            status: "cancelled"
        });
        const statusCounts = await orders.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);
        const salesResult = await orders.aggregate([
            {
                $match: {
                    status: {
                        $nin: ["cancelled", "canceled"]
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: "$totalAmount" }
                }
            }
        ]);

        const totalSales = salesResult[0]?.totalSales || 0;
        return res.status(200).json({
            message: "Order statistics fetched successfully",
            totalOrders,
            statusCounts,
            pendingOrders,
            processingOrders,
            deliveredOrders,
            cancelledOrders,
            totalSales
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch order statistics",
            error: error.message
        });
    }
};

