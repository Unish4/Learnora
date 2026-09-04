import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/jwt.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinaryUpload.js";

export const register = async (req, res) => {
  try {
    const { name, email, password, role, bio } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "Please provide name, email, and password",
      });
    }

    const validRoles = ["student", "instructor"];

    if (role && !validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: `Invalid role. Valid roles: ${validRoles.join(", ")}`,
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "A user with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      bio: bio || "",
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res
        .status(400)
        .json({ success: false, error: messages.join(", ") });
    }
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ success: false, error: "Email already exists" });
    }
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Please provide email and password",
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid email or password" });
    }

    if (!user.isActive) {
      return res
        .status(401)
        .json({ success: false, error: "Account deactivated" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid email or password" });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { password, role, email, ...updateData } = req.body;

    const user = await User.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: "Please provide current and new password",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: "New password must be at least 6 characters",
      });
    }

    const user = await User.findById(req.user.id).select("+password");

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, error: "Current password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "Please upload an image",
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Keep the old avatar information before replacing it
    const oldAvatar = user.avatar;

    // 1. Upload the new avatar first
    const result = await uploadToCloudinary(
      req.file.buffer,
      req.file.mimetype,
      "Learnora/avatars",
    );

    // 2. Update the user's avatar with the new image
    user.avatar = {
      url: result.url,
      publicId: result.publicId,
    };

    // 3. Save the database first
    await user.save();

    // 4. Delete the old Cloudinary image only after DB save succeeds
    if (oldAvatar?.publicId) {
      try {
        await deleteFromCloudinary(oldAvatar.publicId);
      } catch (error) {
        console.error("Failed to delete old avatar:", error);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Avatar uploaded",
      data: {
        avatar: user.avatar,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const deleteAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.avatar?.publicId) {
      return res
        .status(400)
        .json({ success: false, error: "No avatar to delete" });
    }

    await deleteFromCloudinary(user.avatar.publicId);
    user.avatar = { url: "", publicId: "" };
    await user.save();

    return res.status(200).json({ success: true, message: "Avatar removed" });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
