const fs = require("fs");
const uploadPath = "Server/public/temp";

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}
const multer = require("multer");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const cleanName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
        cb(null, uniqueSuffix + '-' + cleanName);
    },
});

const upload = multer({ storage: storage });

module.exports = { upload };