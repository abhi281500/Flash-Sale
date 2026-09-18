import User from "../models/User.models.js"

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
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            })
        }
        const existingUser = await User.findOne({
            email
        })
        if (!existingUser) {
            return res.status(400).json({
                message: "User are not registered"
            })
        }
        existingUser.comparePassword(password)
        return res.status(200).json({
            message: "User Login Successfully"
        })

    }
    catch (error) {
        console.log(" Login Error", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });

    }
}
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

