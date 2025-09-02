import express, { Request, Response } from "express";
import path from "path";
import EventRouter from './routes/Event.route';
import FounderRouter from './routes/Founder.route';
import InvestorRouter from './routes/Investor.route';
import NewsRouter from './routes/News.route';
import PartnerRouter from './routes/Partner.route';
import StartupRouter from './routes/Startup.route';
import UserRouter from './routes/User.route';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "../../Survivor/dist")));
app.use(express.json());

app.use('/event', EventRouter);
app.use('/founder', FounderRouter);
app.use('/investor', InvestorRouter);
app.use('/news', NewsRouter);
app.use('/partner', PartnerRouter);
app.use('/startup', StartupRouter);
app.use('/user', UserRouter);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../../Survivor/dist/index.html"));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
