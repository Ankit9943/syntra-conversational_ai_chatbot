const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const { generateResponse, generateVector } = require("../service/ai.service");
const messageModel = require("../models/message.model");
const { createMemory, queryMemory } = require("../service/vector.service");
const {
  chat,
} = require("@pinecone-database/pinecone/dist/assistant/data/chat");

function initSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  /* Middleware for checking authenticated user requesting for making socket io connection */
  io.use(async (socket, next) => {
    const cookies = cookie.parse(socket.handshake.headers.cookie || "");
    // console.log("Incoming token: ", cookies.token);
    // Here you can add your authentication logic

    if (!cookies.token) {
      return next(new Error("Authentication error: No token provided"));
    }

    try {
      const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET);
      console.log("Decoded userId:", decoded.id);

      const user = await userModel.findById(decoded.id);

      socket.user = user;
      console.log("Attached user:", user._id);
      next();
    } catch (error) {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    // console.log("User connected", socket.user);
    console.log("New client connected:", socket.id);

    socket.on("ai-message", async (messagePayload) => {
      //   console.log(messagePayload);

      /*   const message = await messageModel.create({
        user: socket.user._id,
        chat: messagePayload.chat,
        content: messagePayload.content,
        role: "user",
      });

      const vectors = await generateVector(messagePayload.content);
       */

      const [message, vectors] = await Promise.all([
        messageModel.create({
          user: socket.user._id,
          chat: messagePayload.chat,
          content: messagePayload.content,
          role: "user",
        }),
        generateVector(messagePayload.content),
      ]);

      // console.log(socket.user._id);

      await createMemory({
        vectors,
        messageId: message._id,
        metadata: {
          chat: messagePayload.chat,
          user: socket.user._id,
          text: messagePayload.content,
        },
      });

      // console.log(vectors);

      /* 
      const memory = await queryMemory({
        queryVector: vectors,
        limit: 3,
        filter: {
          user: { $eq: socket.user._id },
        },
      });

       const chatHistory = (
        await messageModel
          .find({
            chat: messagePayload.chat,
          })
          .sort({ createdAt: -1 })
          .limit(20)
          .lean()
      ).reverse();
      
      */

      const [memory, chatHistory] = await Promise.all([
        queryMemory({
          queryVector: vectors,
          limit: 3,
          metadata: {
            user: socket.user._id,
          },
        }),
        messageModel
          .find({
            chat: messagePayload.chat,
          })
          .sort({ createdAt: -1 })
          .limit(20)
          .lean()
          .then((messages) => messages.reverse()),
      ]);

      // console.log(memory);

      // await createMemory({
      //   vectors,
      //   messageId: message._id,
      //   metadata: {
      //     chat: messagePayload.chat,
      //     user: socket.user._id,
      //     text: messagePayload.content,
      //   },
      // });

      // const aiResponse = await generateResponse(messagePayload.content);

      /* this is How you implement Short Term Memory(STM) */
      const stm = chatHistory.map((item) => {
        return {
          role: item.role,
          parts: [{ text: item.content }],
        };
      });

      const ltm = [
        {
          role: "user",
          parts: [
            {
              text: `these are some previous messages from the chat, use them to generate a response
              
              ${memory.map((item) => item.metadata.text).join("\n")}
              
              `,
            },
          ],
        },
      ];

      console.log(ltm[0]);
      console.log(stm);

      const aiResponse = await generateResponse([...ltm, ...stm]);
      // console.log(aiResponse);

      /* 
      const responseMessage = await messageModel.create({
        chat: messagePayload.chat,
        user: socket.user._id,
        content: aiResponse,
        role: "model",
      });

      const responseVectors = await generateVector(aiResponse); 
      */

      socket.emit("ai-response", {
        content: aiResponse,
        chat: messagePayload.chat,
      });
      const [responseMessage, responseVectors] = await Promise.all([
        messageModel.create({
          chat: messagePayload.chat,
          user: socket.user._id,
          content: aiResponse,
          role: "model",
        }),

        generateVector(aiResponse),
      ]);

      await createMemory({
        vectors: responseVectors,
        messageId: responseMessage._id,
        metadata: {
          chat: messagePayload.chat,
          user: socket.user._id,
          text: aiResponse,
        },
      });
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
}

module.exports = initSocketServer;
