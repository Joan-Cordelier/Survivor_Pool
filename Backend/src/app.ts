import express, { Request, Response } from "express";
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get("/", (req: Request, res: Response) => {
    res.send("Hello world!");
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
