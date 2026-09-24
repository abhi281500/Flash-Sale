import User from "../models/User.models.js"
import { generateToken } from "../utils/generatetoken.js"
export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            })
        }
        const existingUser = await User.findOne({
            email
        })
        if (existingUser) {
            return res.status(409).json({
                message: "User are already registered"
            })
        }

        const user = await User.create({
            name,
            email,
            password
        });
        return res.status(201).json({
    message: "User Created Successfully",
    user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
    }
});

    }
    catch (error) {
        console.log(" Registration Error", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });

    }
}


export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const existingUser = await User.findOne({ email });

        if (!existingUser) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const isPasswordCorrect =
            await existingUser.comparePassword(password);

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = generateToken(existingUser._id);

        return res.status(200).json({
            success: true,
            message: "User Login Successfully",
            token,
            user: {
                id: existingUser._id,
                name: existingUser.name,
                email: existingUser.email,
                role: existingUser.role
            }
        });

    } catch (error) {
        console.log("Login Error", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const logoutUser = async (req, res) => {
    try {

    }
    catch (error) {
        console.log(" Logout Error", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });

    }
}

