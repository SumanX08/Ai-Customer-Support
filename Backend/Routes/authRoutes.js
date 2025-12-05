import { Router } from "express";
import User from "../Models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = Router();

router.post('/signup',async(req,res)=>{
    try {
        const {email,password,role}=req.body
        if(!email || !password){
            return res.status(400).json({message:"Email and Password are required"})
        }

        const user=await User.findOne({email})

         if (user) {
         return res.status(400).json({ message: "Email already registered" });
         }

        const hashedPassword=await bcrypt.hash(password,10);

        const newUser=await User.create({
            email,
            password:hashedPassword,
            role:role || 'user'
        })

        const token=jwt.sign(
            {id:newUser._id, email:newUser.email, role:newUser.role}
            ,process.env.JWT_SECRET,
            {expiresIn:'7d'})

        res.status(201).json({token,email:newUser.email,role:newUser.role,id:newUser._id});

    } catch (error){
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
})

router.post('/login',async(req,res)=>{
    try {
        const {email,password}=req.body;

        if(!email || !password){
            return res.status(400).json({message:"Email and Password are required"})
        }

         const user = await User.findOne({ email });
        if (!user) {
             return res.status(400).json({ message: "Invalid credentials" });
        }

        const validPassword=await bcrypt.compare(password,user.password);
        if(!validPassword){
            return res.status(400).json({message:"Invalid credentials"})
        }

        const token=jwt.sign(
            {id:user._id, email:user.email, role:user.role}
            ,process.env.JWT_SECRET,
            {expiresIn:'7d'})   

        res.status(200).json({token,user:{email:user.email,role:user.role,id:user._id}});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
        
    }
})



export default router;