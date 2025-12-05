import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';    
import authRoutes from './Routes/authRoutes.js';
import faqRoutes from './Routes/faqRoutes.js';
import documentRoutes from './Routes/documentRoutes.js';
import chatRoutes from './Routes/chatRoutes.js';


dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: "*",
  methods: ["GET", "POST"," DELETE", "PUT", "PATCH"],
}));    

app.use(bodyParser.json());

app.use('/api/auth',authRoutes);
app.use('/api/faq',faqRoutes);
app.use('/api/documents',documentRoutes);
app.use('/api/chat',chatRoutes)
app.use("/uploads", express.static("uploads"));



mongoose.connect(process.env.MONGO_URI)
.then(()=>{
    console.log("Connected")
})
.catch(err=>{console.error(err); process.exit(1);})

app.listen(process.env.PORT||5000,()=>{
})