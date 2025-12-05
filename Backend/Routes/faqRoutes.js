import express from 'express';
import Faq from '../Models/Faq.js';


const router=express.Router();

router.get('/',async(req,res)=>{
    try{
        const faqs=await Faq.find()
        res.status(200).json(faqs);
    }catch(err){
        res.status(500).json({message:'Server Error'});
    }   
});

router.post('/',async(req,res)=>{
    try{
        const { question, answer } = req.body;
        if(!question || !answer){
            return res.status(400).json({message:'Question and Answer are required'});
        }
        
        const newFaq= await Faq.create({question,answer});
        res.status(201).json(newFaq);

    }catch(err){
        res.status(500).json({message:'Server Error'});
    }   
});

router.delete('/:id',async(req,res)=>{
    try{
        const { id } = req.params;
        const deleteFaq= await Faq.findByIdAndDelete(id);
        if(!deleteFaq){
            return res.status(404).json({message:'FAQ not found'});
        }   
        res.status(200).json({message:'FAQ deleted successfully'});

    }   
    catch(err){
        res.status(500).json({message:'Server Error'});
    }

});

export default router;
   