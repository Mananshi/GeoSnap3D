require("dotenv").config();

const config = {
    port: process.env.PORT || 4000,
    nodeEnv: process.env.NODE_ENV || "development",
    databaseUrl: process.env.DATABASE_URL,
    uploadPath: process.env.UPLOAD_PATH || "./uploads",
};

module.exports = config;
