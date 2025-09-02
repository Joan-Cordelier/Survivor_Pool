import express, { Request, Response } from "express";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "../../Survivor/dist")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../../Survivor/dist/index.html"));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
