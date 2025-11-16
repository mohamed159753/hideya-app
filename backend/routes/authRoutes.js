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

router.post("/login", loginValidation, authController.login);



module.exports = router;