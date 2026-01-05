require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/user");
const { ROLES } = require("../models/constants");

const { MONGO_URI } = process.env;

/* ------------------ USER DATA ------------------ */

const users = [
  {
    name: "Vishnu Vardhan A",
    email: "vishnu.ceo@company.com",
    password: "Password@123",
    role: ROLES.CEO,
  },
  /* ---------- TL-1 (Content / Shoot) ---------- */
  {
    name: "G Usha Rani",
    email: "usha.tl1@company.com",
    password: "Password@123",
    role: ROLES.TL_1,
  },
  {
    name: "G Mary Sona",
    email: "marysona.tl1@company.com",
    password: "Password@123",
    role: ROLES.TL_1,
  },

  /* ---------- TL-2 (Design / Edit) ---------- */
  {
    name: "K Surya Chandra Balaji",
    email: "balaji.tl2@company.com",
    password: "Password@123",
    role: ROLES.TL_2,
  },

  /* ---------- Content Creation Team ---------- */
  {
    name: "B Vasu Soma Sekhar",
    email: "Task Stage Timeline",
    password: "Password@123",
    role: ROLES.EMPLOYEE,
  },
  {
    name: "MV Lakshmi",
    email: "lakshmi@company.com",
    password: "Password@123",
    role: ROLES.EMPLOYEE,
  },
  {
    name: "N Pardha Sai",
    email: "pardhasai@company.com",
    password: "Password@123",
    role: ROLES.EMPLOYEE,
  },
  {
    name: "N Prasanna Kumar",
    email: "prasanna@company.com",
    password: "Password@123",
    role: ROLES.EMPLOYEE,
  },
  {
    name: "B Deevena Kumari",
    email: "deevena@company.com",
    password: "Password@123",
    role: ROLES.EMPLOYEE,
  },

  /* ---------- Designing / Editing Team ---------- */
  {
    name: "M Bindesh",
    email: "bindesh@company.com",
    password: "Password@123",
    role: ROLES.EMPLOYEE,
  },
  {
    name: "MD AB Siddhik",
    email: "siddhik@company.com",
    password: "Password@123",
    role: ROLES.EMPLOYEE,
  },
  {
    name: "M Akash",
    email: "akash@company.com",
    password: "Password@123",
    role: ROLES.EMPLOYEE,
  },
  {
    name: "S Rajkumar",
    email: "rajkumar@company.com",
    password: "Password@123",
    role: ROLES.EMPLOYEE,
  },
  {
    name: "K Nitish",
    email: "nitish@company.com",
    password: "Password@123",
    role: ROLES.EMPLOYEE,
  },
  {
    name: "Akhil",
    email: "akhil@company.com",
    password: "Password@123",
    role: ROLES.EMPLOYEE,
  },

  /* ---------- Social Media Manager ---------- */
  {
    name: "Ch S S Karthik",
    email: "karthik.smm@company.com",
    password: "Password@123",
    role: ROLES.SMM,
  },
];

/* ------------------ SEED SCRIPT ------------------ */

const seedUsers = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected");

    for (const user of users) {
      const exists = await User.findOne({ email: user.email });
      if (!exists) {
        await User.create(user);
        console.log(`Created: ${user.name}`);
      } else {
        console.log(`Skipped (exists): ${user.email}`);
      }
    }

    console.log("User seeding completed");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedUsers();
