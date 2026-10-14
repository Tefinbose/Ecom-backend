const roleMidlleware = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Authentication reqired", error: error.message })
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(401).json({ message: "Access denied", error: error.message })
        }

        next()
    }
}

module.exports = roleMidlleware