const path = require("path");
const express = require("express");
const cors = require("cors");
const errorHandler = require("./middleware/error");
const connectDB = require("./config/db");

connectDB();

const app = express();

// app.use(express.json());
app.use(express.json({ limit: "50mb" }));
app.use(cors());
app.use(
  express.urlencoded({
    limit: "50mb",
    parameterLimit: 100000,
    extended: true,
  })
);

app.use("/api/v1/auth", require("./routes/authRoute"));
app.use("/api/v1/admin", require("./routes/adminRoute"));
app.use("/api/v1/staff", require("./routes/staffRoute"));
app.use("/api/v1/user", require("./routes/userRoute"));

// Error Handler Middleware
app.use(errorHandler);

if (process?.env?.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/client/build")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client", "build", "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("Api running");
  });
}
const PORT = 3002;
// const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
const server = require("http").createServer(app);
// const io = require('socket.io')(server, {pingTimeout: 60000});
// const userPostSocket=require('./sockets/userPostSocket');
// userPostSocket(io);

// Done changes to run server instead of app as required for socket io
server.listen(PORT, function () {
  console.log("Server listening on port " + PORT);
});

process.on("unhandledRejection", (err, promise) => {
  console.log(`Logged Error: ${err.message}`);
  server.close(() => process.exit(1));
});
