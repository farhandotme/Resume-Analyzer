import express from "express";
import dotenv from "dotenv";
import resumeRoutes from "./src/routes/resumeRoutes";
dotenv.config();
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());
app.get("/", (req, res) => {
  res.json({ message: "hello there! This is the node js backend" });
});

app.use("/resume", resumeRoutes);
app.listen(3000, () => {
  console.log("running on port 3000");
});
