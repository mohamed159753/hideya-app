const express = require("express");
const { body } = require("express-validator");
const authController = require("../controllers/authController");

const router = express.Router();

const loginValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("يرجى إدخال بريد إلكتروني صحيح"),
  body("password")
    .notEmpty()
    .withMessage("كلمة المرور مطلوبة")
];

// ✅ Handle OPTIONS for login route specifically
router.options("/login", (req, res) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.sendStatus(200);
});

router.post("/login", loginValidation, authController.login);

// ✅ Global OPTIONS handler as fallback
router.options("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  res.sendStatus(200);
});

module.exports = router;