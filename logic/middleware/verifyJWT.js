require('dotenv').config();
const jwt = require('jsonwebtoken');


const verifyJWT = (req, res, next) => {
  const aT = req.headers['authorization'];

  if (!aT) {
    return res.status(401).json({
      StatusCode: 401,
      Message: "failed",
      Data: { error: "Unauthorized access" }
    });
  }

  const accessToken = aT.split(" ")[1];

  if (!accessToken) {
    return res.status(401).json({
      StatusCode: 401,
      Message: "failed",
      Data: { error: "No token provided" }
    });
  }

  jwt.verify(
    accessToken, 
    process.env.ACCESS_TOKEN_SECRET, 
    (err, decoded) => {
    if (err) {
      // return res.status(403).json({
      //   StatusCode: 403,
      //   Message: "failed",
      //   Data: { error: "JWT expired or invalid" }
      // });

      return res.status(403).json({
        error: "TOKEN_EXPIRED"
      });
    }

    req.user = decoded;

    next();
  });
};


module.exports = {
    verifyJWT
};
