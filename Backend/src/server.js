require("dotenv").config();
const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

const app = require("./app");
const connectDB = require("./config/database");

connectDB();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});