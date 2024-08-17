const multer = require('multer');
const path = require('path');
const ExperssError = require('../utils/ErrorHandler');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images'); // direktori untuk menyimpan file
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)); // format nama file
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new ExperssError('Only images are allowed.', 405));
        }
    }
})

module.exports = upload;