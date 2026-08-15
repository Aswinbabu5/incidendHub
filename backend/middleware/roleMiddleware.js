const authorizedSeg = (...role) => {
    return (req, res, nxt) => {
        if (!req.user) {
            return res.status(401).json({
                message: "User not authenticated"
            })
        }

        if (!role.includes(req.user.role)) {
            return res.status(403).json({
                message: "Access denied"
            })
        }
        nxt()
    }
}

module.exports = { authorizedSeg }