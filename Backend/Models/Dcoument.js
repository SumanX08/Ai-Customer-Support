import mongoose from 'mongoose';

const documentSchema=new mongoose.Schema({
    title: { type: String, required: true },
    originalName: { type: String, required: true },
    path:{ type: String, required: true },
    content:{ type: String, required: true },
})

const Document=mongoose.model('Document',documentSchema);
export default Document;