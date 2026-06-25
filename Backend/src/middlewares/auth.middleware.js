const jwt = require("jsonwebtoken");
const tokenBlacklistModel = require("../model/blacklist.model");

async function authUser(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = (authHeader && authHeader.startsWith("Bearer "))
        ? authHeader.slice(7)
        : req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: "token is missing" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const isBlacklisted = await tokenBlacklistModel.findOne({ token });
        if (isBlacklisted) {
            return res.status(401).json({ message: "Token has been invalidated" });
        }

        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
}




module.exports=authUser;