require("dotenv").config();

const http = require("http");
const cors = require("cors");
const express = require("express");
const db = require("./models/index");

const app = express();
const httpServer = http.createServer(app);

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({ origin: "*" }));

// Version
const version = "1.0.0";
const PORT = process.env.PORT || 3000;

// Routes
app.get("/", (req, res) => {
  res.send("vedicerp is running...");
});

app.get("/version", (req, res) => res.send(version));
app.get("/ping", (req, res) => res.send("pong"));

app.use("/apis", require("./src/apis/api.router"));
app.use("/auth", require("./src/auth/auth.router"));
app.use("/docs", require("./src/docs/doc.router"));
app.use("/public", require("./src/public/public.router"));

(async () => {
  try {
    if (process.env.SYNC_REQUIRED.toLocaleLowerCase() === "true") {
      await db.sequelize.sync({ alter: false, force: false });
    }
    await db.sequelize.authenticate();
    console.log("Database connection has been established successfully.");

    // Super-Admin Initialization
    const { Role, User, Company } = db;

    // Check and create 'super-admin' role
    const [superAdminRole, createdRole] = await Role.findOrCreate({
      where: { role_name: "super-admin" },
      defaults: {
        description: "Super Admin with full access to the system",
      },
    });

    if (createdRole) {
      console.log("Super-admin role created successfully.");
    }

    // Check and create default company
    const [defaultCompany, createdCompany] = await Company.findOrCreate({
      where: { company_name: "VEDIC HIVERY PRIVATE LIMITED" },
      defaults: {
        address_line1: "Floor No.: 2nd Floor,Building No./Flat No.: 235 ",
        address_line2: "2nd Stage, Binnamangala,13th Cross Road,  ",
        city: "Bengaluru",
        state: "Karnataka",
        postal_code: "560038",
        country: "India",
        gst_number: "29AAJCV6114G1Z5",
        pan_number: "AAJCV6114G",
        phone_number: "+919700536080",
        email: "info@vedichivery.com",
        website: "https://vedichivery.com",
      },
    });

    if (createdCompany) {
      console.log("Default company created successfully.");
    }

    // Check and create 'super-admin' users
    const [superAdminUser, createdSuperAdminUser] = await User.findOrCreate({
      where: { email: "info@amoghnya.com" },
      defaults: {
        name: "Nagendra Nagarthi",
        mobile_number: "9118191991",
        role_id: superAdminRole.role_id,
        company_id: defaultCompany.company_id,
      },
    });

    if (createdSuperAdminUser) {
      console.log("Super-admin user created successfully.");
    }

    // Start Server
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error(error);
  }
})();
