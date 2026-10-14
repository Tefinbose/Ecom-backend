
const admin = require("../models/adminModel")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

exports.adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" })
        }

        const adminData = await admin.findOne({ email: email.trim().toLowerCase() })
        if (!adminData) {
            return res.status(401).json({ message: "Invalid credentials" })
        }

        const isPasswordValid = await bcrypt.compare(password, adminData.password)
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" })
        }

        const token = jwt.sign({ adminId: adminData._id, role: adminData.role }, process.env.JWT_TOKEN, { expiresIn: "1d" })

        return res.status(200).json({ message: "Login successful", token, adminData: { id: adminData._id, email: adminData.email, role: adminData.role } })

    } catch (error) {
        console.error("Admin login error:", error)

        return res.status(500).json({ message: "Login failed", error: error.message })
    }
}
