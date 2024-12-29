import express from "express";
import { connectDB, connectRedis, } from "./utils/features.js";
import { errorMiddleware } from "./middlewares/error.js";
import { config } from "dotenv";
import morgan from "morgan";
import Stripe from "stripe";
import cors from "cors";
import { v2 as cloudinary } from "cloudinary";

// Importing Routes
import userRoute from "./routes/user.js";
import productRoute from "./routes/products.js";
import orderRoute from "./routes/order.js";
import paymentRoute from "./routes/payment.js";
import dashboardRoute from "./routes/stats.js";
import { createClient } from 'redis';

config({
  path: "./.env",
});
const app = express();
app.use(
  cors({
    origin: '*',
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);


const port = process.env.PORT || 4000;
const mongoURI = process.env.MONGO_URI || "";
const stripeKey = process.env.STRIPE_KEY || "";
export const redisTTL = process.env.REDIS_TTL || 60 * 60 * 4;

connectDB(mongoURI);
export const redis = connectRedis();


// const client = createClient({
//   password: '*******',
//   socket: {
//       host: 'redis-12869.c301.ap-south-1-1.ec2.redns.redis-cloud.com',
//       port: 12869
//   }
// });



cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

export const stripe = new Stripe(stripeKey);



app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.send("API Working with /api/v1");
});

// Using Routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/product", productRoute);
app.use("/api/v1/order", orderRoute);
app.use("/api/v1/payment", paymentRoute);
app.use("/api/v1/dashboard", dashboardRoute);

app.use("/uploads", express.static("uploads"));
app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`Express is working on http://localhost:${port}`);
});
