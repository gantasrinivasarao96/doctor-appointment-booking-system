const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const uploadDirectory = path.join(
  __dirname,
  "..",
  "uploads",
  "medical-documents"
);

fs.mkdirSync(uploadDirectory, {
  recursive: true,
});

const allowedMimeTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
]);

const storage = multer.diskStorage({
  destination: (
    req,
    file,
    callback
  ) => {
    callback(
      null,
      uploadDirectory
    );
  },

  filename: (
    req,
    file,
    callback
  ) => {
    const extensionMap = {
      "application/pdf": ".pdf",
      "image/jpeg": ".jpg",
      "image/png": ".png",
    };

    const randomName =
      crypto
        .randomBytes(24)
        .toString("hex");

    callback(
      null,
      `${randomName}${extensionMap[file.mimetype] || ""}`
    );
  },
});

const fileFilter = (
  req,
  file,
  callback
) => {
  if (
    !allowedMimeTypes.has(
      file.mimetype
    )
  ) {
    const error = new Error(
      "Only PDF, JPEG and PNG medical documents are allowed."
    );

    error.statusCode = 400;

    return callback(error);
  }

  return callback(
    null,
    true
  );
};

const medicalDocumentUpload =
  multer({
    storage,

    fileFilter,

    limits: {
      fileSize:
        5 * 1024 * 1024,

      files: 1,
    },
  });

const uploadMedicalDocument = (
  req,
  res,
  next
) => {
  medicalDocumentUpload.single(
    "medicalDocument"
  )(
    req,
    res,
    (error) => {
      if (!error) {
        return next();
      }

      if (
        error instanceof
          multer.MulterError &&
        error.code ===
          "LIMIT_FILE_SIZE"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Medical document must not exceed 5 MB.",
        });
      }

      return res.status(
        error.statusCode || 400
      ).json({
        success: false,
        message:
          error.message ||
          "Medical document upload failed.",
      });
    }
  );
};

module.exports = {
  uploadMedicalDocument,
  uploadDirectory,
};
