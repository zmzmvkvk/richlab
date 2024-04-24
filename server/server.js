require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const path = require("path");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

app.use(bodyParser.json()); // 요청 본문 파싱
app.use(express.static(path.join(__dirname, "../client/build")));

const { MongoClient } = require("mongodb");
const dbUser = process.env.DB_USER;
const dbPassword = encodeURIComponent(process.env.DB_PASSWORD);
const dbName = "richlab";
const PORT = process.env.PORT;

const dburl = `mongodb+srv://${dbUser}:${dbPassword}@cluster0.xseitpb.mongodb.net/`;
let db;

new MongoClient(dburl)
  .connect()
  .then((client) => {
    console.log("DB연결성공");
    db = client.db(dbName);
    app.listen(PORT, () => {
      console.log(`http://localhost:${PORT} 에서 실행중`);
    });
  })
  .catch((err) => {
    console.log(err);
  });

// JWT 검증 미들웨어
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN 형식

  if (token == null) {
    return res.sendStatus(401); // Unauthorized
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403); // Forbidden - Invalid Token
    }
    req.user = user;
    next();
  });
}

app.get("/verify-token", authenticateToken, (req, res) => {
  // 토큰 검증이 성공하면, 검증된 사용자 정보를 반환
  res.status(200).json({ message: "Token is valid", user: req.user });
});

app.post("/login", async (req, res) => {
  const { userid, userpw } = req.body;
  try {
    const user = await db.collection("user").findOne({ userid });
    if (user) {
      const token = jwt.sign({ userid: user.userid }, JWT_SECRET, {
        expiresIn: "1h",
      });
      res.status(200).json({ message: "Login successful", token });
    } else {
      res.status(401).json({ message: "Incorrect credentials" });
    }
  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../client/build", "index.html"));
});
