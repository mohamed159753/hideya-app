const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || "your-secret-key", {
    expiresIn: "1d",
  });
};

exports.login = async (req, res) => {
  console.log("Request body:", req.body);
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    console.log(password);

    const user = await User.findOne({ email })
    console.log("Found user:", user);
    if (!user) {
      return res.status(401).json({ 
        message: "البريد الإلكتروني أو كلمة المرور غير صحيحة" 
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        message: "البريد الإلكتروني أو كلمة المرور غير صحيحة" 
      });
    }

    const token = generateToken(user._id);

    const userData = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      canBePresident: user.canBePresident,
      expertiseLevel: user.expertiseLevel
    };

    res.json({
      message: "تم تسجيل الدخول بنجاح",
      token,
      user: userData
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "حدث خطأ في الخادم" });
  }
};