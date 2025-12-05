// Dashboard.jsx
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DocumentsSection from "../Components/DocumentSection.jsx";
import FaqSection from "../Components/FaqSection.jsx";

export default function Dashboard() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [faqs, setFaqs] = useState([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");

  const navigate = useNavigate();

  const API = import.meta.env.VITE_API_URL;







  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
  };

  const handleUpload = async () => {
    if (!selectedFiles.length) return;
    try {
      setUploading(true);
      const res=await axios.post(`${API}/api/documents/upload`,{
        files:selectedFiles
      },{ headers: {'Content-Type': 'multipart/form-data'}});

      setUploading(false);
      setSelectedFiles([]);
      alert("Files uploaded successfully");
    } catch (error) {
      setUploading(false);
      console.error("Upload failed:", error);
      alert("Failed to upload files");
      
    }
  };

  const handleDeleteDocument=async(id)=>{
    setDocuments((prev)=>prev.filter((doc)=>doc.id!==id));
    axios.delete(`${API}/api/documents/${id}`).catch((err)=>{
      console.error("Failed to delete document:", err);
    } );
  }

  const handleAddFaq = async() => {
    if (!newQuestion.trim() || !newAnswer.trim()) return;

    const newFaq = {
      id: Date.now(),
      question: newQuestion.trim(),
      answer: newAnswer.trim(),
    };

    const res=await axios.post(`${API}/api/dashboard`,{
      question:newFaq.question,
      answer:newFaq.answer
    });
    newFaq.id=res.data._id; 

    setFaqs((prev) => [newFaq, ...prev]);
    setNewQuestion("");
    setNewAnswer("");
  };

      console.log(faqs);


  const handleDeleteFaq = (id) => {
    setFaqs((prev) => prev.filter((faq) => faq.id !== id));
    axios.delete(`${API}/api/dashboard/${id}`).catch((err)=>{
      console.error("Failed to delete FAQ:", err);
    }); 
  };



  return (
    <div className="min-h-screen bg-white">
      <header className="bg-gray-100 backdrop-blur">
        <div className="mx-aut flex max-w-6xl items-center gap-6 px-4 py-4">
          <button className="cursor-pointer" onClick={()=>navigate('/')}>
            <ArrowLeft/>
          </button>
          
          <h1 className="text-xl font-semibold text-black">
            Admin Dashboard
          </h1>
        
        </div>
      </header>
<div className="flex lg:flex-row flex-col justify-between gap-5 m-4">
<section className="w-full lg:w-4/5">
          <DocumentsSection API={API} />
        </section>

        {/* Right: FAQs */}
        <section className="w-full lg:w-4/5">
          <FaqSection API={API} />
        </section>
</div>
       


    </div>
  );
}
