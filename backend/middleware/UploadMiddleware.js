const multer = require("multer")
const path = require("path")

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },

    filename: (req, file, cb) => {
        const uniqueName = Date.now() + "-" + file.originalname

        cb(null, uniqueName)
    }
})

const fileFilter = (req, file, cb) => {

    const allowedTypes = [
        "text/plain",
        "application/pdf",
        "image/png",
        "image/jpeg"
    ]

    const allowedExtensions = [
        ".txt",
        ".log",
        ".pdf",
        ".png",
        ".jpg",
        ".jpeg"
    ]

    const extension = path.extname(file.originalname).toLowerCase()

    if (allowedTypes.includes(file.mimetype) && allowedExtensions.includes(extension)) 
        cb(null, true)
    else 
        cb(new Error("File type not allowed"), false)
    
}

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
})

module.exports = upload;