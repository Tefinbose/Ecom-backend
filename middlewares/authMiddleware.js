const jwt = require("jsonwebtoken")

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization

        if (!authHeader) {
            return res.status(401).json({ message: "Authorizatin header missing" })
        }

        const token = authHeader.split(" ")[1]
        if (!token) {
            return res.status(401).json({ message: "Token is missing"})
        }

        const decodedToken = jwt.verify(token, process.env.JWT_TOKEN)
        req.user = decodedToken
        next()

    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token"})
    }
}

module.exports = authMiddleware