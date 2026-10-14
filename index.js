require("dotenv").config()

const express = require("express")

const cors = require("cors")

const adminRoutes = require("./routes/adminRoutes")

const orderRoutes= require("./routes/orderRoutes")

require("./config/db")

const shopifyServer = express()

shopifyServer.use(cors())

shopifyServer.use(express.json())

shopifyServer.use("/api/admin", adminRoutes)

shopifyServer.use("/api/orders", orderRoutes)

shopifyServer.use("/uploads", express.static("uploads"))

shopifyServer.get("/", (req, res) => {
    res.status(200).send("Server Started")
})

const PORT = process.env.PORT

shopifyServer.listen(PORT, () => {
    console.log(`Server is Running on port ${PORT}`);

})