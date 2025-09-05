import dotenv from 'dotenv';
dotenv.config({quiet: true});

import express, { Request, Response } from "express";
import cors from 'cors';
import path from "path";

//Routes
import EventRouter from './routes/Event.route';
import FounderRouter from './routes/Founder.route';
import InvestorRouter from './routes/Investor.route';
import NewsRouter from './routes/News.route';
import PartnerRouter from './routes/Partner.route';
import StartupRouter from './routes/Startup.route';
import UserRouter from './routes/User.route';
import AuthRouter from './routes/Auth.route';

//utils
import { syncDB } from './utils/SyncDb.utils';

const app = express();
const PORT = process.env.PORT || 3000;

const allowed = [
  'http://localhost:5173',              // dev
  'https://joan-cordelier.github.io',   // GitHub Pages
];

app.use(cors({ origin: allowed, credentials: true }));
app.use(express.static(path.join(__dirname, "../../Survivor/dist")));
app.use(express.json());

app.use('/event', EventRouter);
app.use('/founder', FounderRouter);
app.use('/investor', InvestorRouter);
app.use('/news', NewsRouter);
app.use('/partner', PartnerRouter);
app.use('/startup', StartupRouter);
app.use('/user', UserRouter);
app.use('/auth', AuthRouter);

app.get("/", (req, res) => {
  res.send('Hello World!');
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

syncDB();
