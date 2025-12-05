// FaqSection.jsx
import { useEffect, useState } from "react";
import axios from "axios";

export default function FaqSection({ API }) {
  const [faqs, setFaqs] = useState([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");

  const fetchFaqs = async () => {
    try {
      const res = await axios.get(`${API}/api/faq`);
      setFaqs(res.data || []);
    } catch (error) {
      console.error("Failed to fetch FAQs:", error);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleAddFaq = async () => {
    if (!newQuestion.trim() || !newAnswer.trim()) return;

    try {
      const res = await axios.post(`${API}/api/faq`, {
        question: newQuestion.trim(),
        answer: newAnswer.trim(),
      });

      // assuming backend returns created FAQ with _id
      const created = res.data;
      setFaqs((prev) => [created, ...prev]);

      setNewQuestion("");
      setNewAnswer("");
    } catch (error) {
      console.error("Failed to add FAQ:", error);
    }
  };

  const handleDeleteFaq = async (id) => {
    // optimistic update
    setFaqs((prev) => prev.filter((faq) => faq._id !== id));
    try {
      await axios.delete(`${API}/api/faq/${id}`);
    } catch (err) {
      console.error("Failed to delete FAQ:", err);
      // optional: re-fetch FAQs if needed
      // fetchFaqs();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Add FAQ */}
      <div className="rounded-2xl bg-gray-100 p-5 shadow-lg">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">FAQ</h2>
          </div>
        </div>

        <div className="mt-4 space-y-3 text-sm">
          <div>
            <label className="mb-1 block text-xs font-medium text-black">
              Question
            </label>
            <input
              type="text"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Enter question"
              className="w-full rounded-xl bg-white px-3 py-2 text-xs outline-none placeholder:text-gray-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-black">
              Answer
            </label>
            <textarea
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              placeholder="Enter answer for the question"
              rows={4}
              className="w-full resize-none rounded-xl bg-white px-3 py-2 text-xs outline-none placeholder:text-gray-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleAddFaq}
              className="rounded-xl bg-blue-500 px-4 py-2 text-xs font-semibold text-sky-950 shadow-sm shadow-sky-500/40"
            >
              Add FAQ
            </button>
          </div>
        </div>
      </div>

      {/* FAQ List */}
      <div className="rounded-2xl bg-gray-100 p-5 shadow-lg ">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-black">All FAQs</h3>
        </div>

        {faqs.length === 0 ? (
          <p className="text-xs text-gray-500">No FAQs added yet</p>
        ) : (
          <div className="space-y-3 max-h-72 overflow-auto pr-1">
            {faqs.map((faq) => (
              <div
                key={faq._id}
                className="rounded-xl p-3 text-xs bg-white"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-black text-lg">
                      Q: {faq.question}
                    </p>
                    <p className="mt-1 text-black text-md">
                      A: {faq.answer}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteFaq(faq._id)}
                    className="text-md text-white bg-red-500 rounded p-2"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
