const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// register the section
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        message: "name,email ,password are required",
      });
    }
    if (password.length < 8) {
      return res.status(400).json({
        message: "password must be 8 characters",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        message: "Email is already registered",
      });
    }
    const hashPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashPassword,
      phone,
    });
    res.status(200).json({
      message: "User Registered succesfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Registration failed",
    });
  }
};

// Login the user
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        message: "email and password required",
      });
    }
    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+password");
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }
    if (!user.isActive) {
      return res.status(403).json({
        message: "This account is inactive",
      });
    }
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_TOKEN,
      { expiresIn: "1d" },
    );
    res.json({
      message: "Login successfull",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).status({
      message: "Login failed",
    });
  }
};

// get all users

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select(
      "name email phone role isActive createdAt"
    );
    res.json({
      count: users.length,
      users,
    })

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch users",
    });
  }
}
// Get logged-in user's profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "name email phone role isActive createdAt"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      message: "Profile fetched successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch profile",
    });
  }
};
// Update logged-in user's profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;

    const updates = {};

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
          message: "Name cannot be empty",
        });
      }
      updates.name = name.trim();
    }

    if (phone !== undefined) {
      updates.phone = phone;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("name email phone role isActive createdAt");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Profile update failed",
    });
  }
};

// Delete a customer (admin only)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deleteUser = await User.findByIdAndDelete(id);
    if (!deleteUser) {
      return res.status(404).json({
        message: "Customer not found"
      });
    }
    res.status(200).json({
      message: "Customer deleted successfully",
      user: deleteUser,
    })

  } catch (error) {
    res.status(500).json({ message: "Failed to delete customer", error: error.message });

  }
}

// Export the controller functions
exports.registerUser = this.registerUser;
exports.loginUser = this.loginUser;
exports.getAllUsers = this.getAllUsers;
exports.getProfile = this.getProfile;
exports.updateProfile = this.updateProfile;
exports.deleteUser = this.deleteUser;