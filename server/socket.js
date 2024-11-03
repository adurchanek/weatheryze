module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("New client connected");

    socket.emit("welcome", { message: "Welcome to the Weather App!" });

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });
};
