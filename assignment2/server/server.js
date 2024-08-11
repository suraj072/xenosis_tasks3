const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { Server } = require("socket.io");
const http = require("http");
const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/tasks");
const { protect } = require("./middleware/authMiddleware");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

mongoose
  .connect(
    "mongodb+srv://admin:admin@cluster0.u0m7oam.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0/blog",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

io.on("connection", (socket) => {
  console.log("New WebSocket connection");
});

io.on("connection", function (socket) {
  console.log("connected socket!");

  socket.on("greet", function (data) {
    console.log(data);
    socket.emit("respond", { hello: "Hey, Mr.Client!" });
  });
  socket.on("disconnect", function () {
    console.log("Socket disconnected");
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
