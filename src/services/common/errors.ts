const Errors = {
  BAD_REQUEST: {
    statusCode: 400,
    message: "Bad request",
  },
  AUTH_FAILED: {
    statusCode: 401,
    message: "Authorization failed",
  },
  DATA_NOT_FOUND: {
    statusCode: 404,
    message: "Data not found",
  },
  INTERNAL_SERVER_ERROR: {
    statusCode: 500,
    message: "Internal server error",
  },
};

export default Errors;
