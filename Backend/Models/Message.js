import mongoose from 'mongoose';

const messageSchema=new mongoose.Schema({
    chatId:{type:mongoose.Schema.Types.ObjectId ,ref:'Chat',required:true},
    senderId:{type:mongoose.Schema.Types.ObjectId ,ref:'User'},
    text:{type:String,required:true,trim:true},
}
,{timestamps:true});


const Message=mongoose.model('Message',messageSchema);
export default Message; 