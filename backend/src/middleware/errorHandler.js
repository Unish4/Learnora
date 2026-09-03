export const errorHandler = (err, req, res, next) => {
  console.error("ERROR:", err.message);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      error: Object.values(err.errors)
        .map((e) => e.message)
        .join(", "),
    });
  }

  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      error: "Duplicate field value",
    });
  }

  res.status(statusCode).json({
    success: false,
    error: message,
  });
};

export const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`,
  });
};
