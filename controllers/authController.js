const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const {
    createUser,
    findUserByEmail
} = require("../models/User");

const appEvents = require("../events/appEvents");

function generateToken(user) {
    return jwt.sign(
        {
            sub: user._id.toString(),
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || "1d"
        }
    );
}

// USER SIGNUP
async function signup(req, res) {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            });
        }

        if (typeof name !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string") {
            return res.status(400).json({
                success: false,
                message: "Invalid input format"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must contain at least 8 characters"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await findUserByEmail(normalizedEmail);

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email is already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const result = await createUser({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword
        });

        const user = {
            _id: result.insertedId,
            name: name.trim(),
            email: normalizedEmail,
            role: "user"
        };

        const token = generateToken(user);

        appEvents.emit("user:registered", user);

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            token,
            user
        });

    } catch (error) {
        console.error("Signup Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

// USER LOGIN
async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password ||
            typeof email !== "string" ||
            typeof password !== "string") {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const user = await findUserByEmail(email);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const token = generateToken(user);

        appEvents.emit("user:loggedIn", user);

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Login Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

module.exports = {
    signup,
    login
};
