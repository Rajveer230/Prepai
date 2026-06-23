const userModel = require("../model/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const tokenBlacklistmodel = require("../model/blacklist.model");
const { sendOtpEmail } = require("../utils/email");

function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function getOtpExpiry() {
    return new Date(Date.now() + 10 * 60 * 1000);
}

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

        if (existingEmail && existingEmail.isVerified) {
            return res.status(400).json({ message: "Email already registered" });
        }

        const takenUsername = await userModel.findOne({ username, isVerified: true });
        if (takenUsername) {
            return res.status(400).json({ message: "Username already taken" });
        }

        const otp = generateOtp();
        const otpExpiry = getOtpExpiry();
        const hashPassword = await bcrypt.hash(password, 10);

        if (existingEmail && !existingEmail.isVerified) {
            await userModel.findByIdAndUpdate(existingEmail._id, {
                username,
                password: hashPassword,
                otp,
                otpExpiry,
            });
        } else {
            await userModel.create({ username, email, password: hashPassword, otp, otpExpiry });
        }

        await sendOtpEmail(email, otp, "register");

        res.status(201).json({
            message: "OTP sent to your email. Please verify your account.",
            email,
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

        const otp = generateOtp();
        const otpExpiry = getOtpExpiry();
        await userModel.findByIdAndUpdate(user._id, { otp, otpExpiry });

        const type = user.isVerified ? "login" : "register";
        await sendOtpEmail(email, otp, type);

        const message = user.isVerified
            ? "OTP sent to your email."
            : "Account not verified. OTP sent to your email.";

        res.status(200).json({ message, requiresOtp: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const verifyOtpController = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: "Email and OTP are required" });
        }

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!user.otp || user.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        if (user.otpExpiry < new Date()) {
            return res.status(400).json({ message: "OTP has expired. Please request a new one." });
        }

        await userModel.findByIdAndUpdate(user._id, {
            isVerified: true,
            otp: null,
            otpExpiry: null,
        });

        const token = generateToken(user);
        setTokenCookie(res, token);

        res.status(200).json({
            message: "Verified successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const resendOtpController = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const otp = generateOtp();
        const otpExpiry = getOtpExpiry();
        await userModel.findByIdAndUpdate(user._id, { otp, otpExpiry });

        const type = user.isVerified ? "login" : "register";
        await sendOtpEmail(email, otp, type);

        res.status(200).json({ message: "OTP resent successfully" });
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
    verifyOtpController,
    resendOtpController,
};
