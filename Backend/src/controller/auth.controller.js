const userModel = require("../model/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const tokenBlacklistmodel = require("../model/blacklist.model");

function generateToken(user) {
    return jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );
}

function setTokenCookie(res, token) {
    const isProd = process.env.NODE_ENV === "production";
    res.cookie("token", token, {
        httpOnly: true,
        secure:   isProd,
        sameSite: isProd ? "none" : "lax",
        maxAge:   24 * 60 * 60 * 1000,
    });
}

const registerUsercontroller = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingEmail = await userModel.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ message: "Email already registered" });
        }

        const takenUsername = await userModel.findOne({ username });
        if (takenUsername) {
            return res.status(400).json({ message: "Username already taken" });
        }

        const hashPassword = await bcrypt.hash(password, 10);
        const user = await userModel.create({ username, email, password: hashPassword, isVerified: true });

        const token = generateToken(user);
        setTokenCookie(res, token);

        res.status(201).json({
            message: "Account created successfully",
            token,
            user: { id: user._id, username: user.username, email: user.email },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const loginUsercontroller = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = generateToken(user);
        setTokenCookie(res, token);

        res.status(200).json({
            message: "Logged in successfully",
            token,
            user: { id: user._id, username: user.username, email: user.email },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const logoutUsercontroller = async (req, res) => {
    try {
        const token = req.cookies.token;
        if (token) {
            await tokenBlacklistmodel.create({ token });
        }
        const isProd = process.env.NODE_ENV === "production";
        res.clearCookie("token", {
            httpOnly: true,
            secure:   isProd,
            sameSite: isProd ? "none" : "lax",
        });
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getMecontroller = async (req, res) => {
    try {
        const user = await userModel.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({
            message: "User details fetched successfully",
            user: { id: user._id, username: user.username, email: user.email },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {
    registerUsercontroller,
    loginUsercontroller,
    logoutUsercontroller,
    getMecontroller,
};