const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const readline = require("readline");
require("dotenv").config();

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// User Schema
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    role: { type: String, enum: ["admin", "jury"], required: true },
    canBePresident: { type: Boolean, default: false },
    expertiseLevel: { type: Number, min: 1, max: 10 },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function createUser() {
  try {
    console.log("🎯 Create New User for Quran Competition");
    console.log("=======================================\n");

    // Get MongoDB URL from environment or use default

    const MONGODB_URI = process.env.MONGO_URI;

    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB\n");

    // Get user input
    const email = await askQuestion("📧 Email: ");
    const password = await askQuestion("🔑 Password: ");
    const firstName = await askQuestion("👤 First Name: ");
    const lastName = await askQuestion("👤 Last Name: ");

    console.log("\n🎭 Role:");
    console.log("1 - admin");
    console.log("2 - jury");
    const roleChoice = await askQuestion("Choose role (1 or 2): ");
    const role = roleChoice === "1" ? "admin" : "jury";

    let canBePresident = false;
    let expertiseLevel = 5;

    if (role === "jury") {
      const presidentChoice = await askQuestion("🤵 Can be president? (y/n): ");
      canBePresident = presidentChoice.toLowerCase() === "y";

      const expertise = await askQuestion("📊 Expertise level (1-10): ");
      expertiseLevel = parseInt(expertise) || 5;
    }

    // Show summary
    console.log("\n📋 Summary:");
    console.log("───────────");
    console.log(`Email: ${email}`);
    console.log(`Name: ${firstName} ${lastName}`);
    console.log(`Role: ${role}`);
    if (role === "jury") {
      console.log(`Can be president: ${canBePresident ? "Yes" : "No"}`);
      console.log(`Expertise level: ${expertiseLevel}`);
    }

    const confirm = await askQuestion("\n✅ Create this user? (y/n): ");

    if (confirm.toLowerCase() === "y") {
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const user = new User({
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        role,
        canBePresident,
        expertiseLevel,
      });

      await user.save();
      console.log("\n🎉 User created successfully!");
      console.log(`📧 Email: ${user.email}`);
      console.log(`👤 Name: ${user.firstName} ${user.lastName}`);
      console.log(`🎭 Role: ${user.role}`);
      console.log(`🆔 User ID: ${user._id}`);
    } else {
      console.log("\n❌ Operation cancelled");
    }
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    if (error.code === 11000) {
      console.log("⚠️  Email already exists");
    }
  } finally {
    rl.close();
    await mongoose.connection.close();
    console.log("\n🔌 Database connection closed");
    process.exit(0);
  }
}

// Start the script
createUser();
