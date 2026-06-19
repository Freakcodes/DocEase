import multer from 'multer'

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null);
    },
    filename: function (req, file, callback) {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        callback(null, uniqueName);
    },
});

const fileFilter = (req, file, callback) => {
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (allowedTypes.includes(file.mimetype)) {
        callback(null, true);
    } else {
        callback(new Error("Only PDF, JPG, and PNG files are allowed"), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
});

export default upload;