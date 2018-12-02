require("dotenv").config({ path: "variables.env" });
const cookieParser = require("cookie-parser");
const createServer = require("./createServer");
const jwt = require("jsonwebtoken");
const db = require("./db");

const server = createServer();

// TODO: use express middleware to handle cookies (JWT)
// TODO: use express middleware to populate current user

server.express.use(cookieParser());
server.express.use((req, res, next) => {
  const { token } = req.cookies;
  if (token && token !== "undefined") {
    const { userId } = jwt.verify(token, process.env.APP_SECRET);
    res.userId = userId;
  }
  next();
});

server.start(
  {
    cors: {
      credentials: true,
      origin: process.env.FRONTEND_URL
    }
  },
  deets => {
    console.log(`Server is now running on port http://localhost:${deets.port}`);
  }
);
