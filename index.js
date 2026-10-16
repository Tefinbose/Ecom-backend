require("dotenv").config();

const express = require("express");

const cors = require("cors");

const adminRoutes = require("./routes/adminRoutes");
const productRoutes = require("./routes/productRoutes");

const collectionRoutes = require("./routes/collectionRoutes");

const inventoryRoutes = require("./routes/inventoryRoutes");

const orderRoutes = require("./routes/orderRoutes");
const userRoutes = require("./routes/userRoutes");

require("./config/db");

const shopifyServer = express();

shopifyServer.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  }),
);

shopifyServer.use(express.json());

shopifyServer.use("/api/admin", adminRoutes);

shopifyServer.use("/api/products", productRoutes);

shopifyServer.use("/api/collections", collectionRoutes);

shopifyServer.use("/api/inventory", inventoryRoutes);

shopifyServer.use("/api/orders", orderRoutes);

shopifyServer.use("/api/users", userRoutes);

shopifyServer.use("/uploads", express.static("uploads"));

shopifyServer.get("/", (req, res) => {
  res.status(200).send("Server Started");
});

const PORT = process.env.PORT;

shopifyServer.listen(PORT, () => {
  console.log(`Server is Running on port ${PORT}`);
});
