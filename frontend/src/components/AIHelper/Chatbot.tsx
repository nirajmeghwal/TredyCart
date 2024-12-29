import { useState } from "react";
import axios from "axios";
import { RootState, server } from "../../redux/store";
import { useSelector } from "react-redux";


interface ChatbotProps {
  setDatatoParent: (data: any) => void; 
}

const Chatbot: React.FC<ChatbotProps> = ({ setDatatoParent }) => {
  const [messages, setMessages] = useState([{ role: "bot", text: "Hi, how can I help you today?" }]);
  const [ChatResponse, setChatResponse] = useState();
  const [input, setInput] = useState("");
  const { user, loading } = useSelector(
    (state: RootState) => state.userReducer
  );
  const id=user?._id;

  const handleInputChange = (e:any) => {
    setInput(e.target.value);
  };

  const handleSendMessage = async (e:any) => {
    e.preventDefault();

    if (input.trim() === "") return;

    // Add the user message to the messages array
    setMessages((prevMessages) => [...prevMessages, { role: "user", text: input }]);

    try {
      // Clear the input field
      const text = input;
      setInput("");

      // Send the user message to the ChatGPT API
      const response = await axios.get(`${server}/api/v1/product/ai?id=${id}&text=${text}`);
      setDatatoParent(response.data.prodNames);

      // Extract the bot response from the API response
      const botResponse = response.data.AIRes.text;
      setChatResponse(botResponse);

      // Add the bot response to the messages array
      setMessages((prevMessages) => [...prevMessages, { role: "bot", text: botResponse }]);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <>
      <button
        style={{
          position: "fixed",
          bottom: "1.5rem",
          right: "1.5rem",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1rem",
          fontWeight: "bold",
          border: "none",
          borderRadius: "50%",
          width: "4rem",
          height: "4rem",
          backgroundColor: "#1F2937",
          color: "#F9FAFB",
          cursor: "pointer",
          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
          transition: "background-color 0.3s, transform 0.3s",
        }}
        type="button"
        aria-haspopup="dialog"
        aria-expanded="false"
        data-state="closed"
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#374151")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1F2937")}
        onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.95)")}
        onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="30"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"></path>
        </svg>
      </button>
      <div
        style={{
          position: "absolute",
          marginRight: "1rem",
          backgroundColor: "#f5f5f5",
          padding: "1.5rem",
          borderRadius: "0.75rem",
          border: "1px solid #e5e7eb",
          width: "38%",
          boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
          height:"100vh",
          
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem", paddingBottom: "1.5rem"}}>
          <h2 style={{ fontWeight: "600", fontSize: "1.125rem", letterSpacing: "0.01em" }}>Chat With AI</h2>
        </div>

        {/* Chat Container */}
        <div
          style={{
            height: "70vh",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            borderBottom: "1px solid #E5E7EB",
            marginBottom: "1rem",
           
          }}
        >
          {messages.map((message, index) =>
            message.role === "bot" ? (
              <div key={index} style={{ display: "flex", gap: "0.75rem", color: "#4B5563", fontSize: "0.875rem" }}>
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "2.5rem",
                    height: "2.5rem",
                    backgroundColor: "#F3F4F6",
                    borderRadius: "50%",
                    border: "1px solid #D1D5DB",
                  }}
                >
                  <svg
                    stroke="none"
                    fill="black"
                    strokeWidth="1.5"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    height="30"
                    width="30"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                    ></path>
                  </svg>
                </span>
                <p style={{ lineHeight: "1.5" }}>
                  <span style={{ display: "block", fontWeight: "bold", color: "#1F2937" }}>AI</span>
                  {message.text}
                </p>
              </div>
            ) : (
              <div key={index} style={{ display: "flex", gap: "0.75rem", color: "#4B5563", fontSize: "0.875rem" }}>
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "2.5rem",
                    height: "2.5rem",
                    backgroundColor: "#F3F4F6",
                    borderRadius: "50%",
                    border: "1px solid #D1D5DB",
                  }}
                >
                  <svg
                    stroke="none"
                    fill="black"
                    strokeWidth="0"
                    viewBox="0 0 16 16"
                    height="20"
                    width="20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4Zm-1-.002c-.001-.246-.17-.986-1.186-1.698C11.75 10.62 10.489 10 8 10c-2.49 0-3.75.62-4.814 1.3-.966.67-1.157 1.394-1.185 1.696h11.998Z"></path>
                  </svg>
                </span>
                <p style={{ lineHeight: "1.5" }}>
                  <span style={{ display: "block", fontWeight: "bold", color: "#1F2937" }}>You</span>
                  {message.text}
                </p>
              </div>
            )
          )}
        </div>

        {/* Input Container */}
        <form onSubmit={handleSendMessage} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Type a message..."
            style={{
              flex: "1",
              padding: "0.75rem",
              borderRadius: "0.5rem",
              border: "1px solid #D1D5DB",
              fontSize: "0.875rem",
              color: "#111827",
              boxShadow: "inset 0 1px 3px rgba(0, 0, 0, 0.1)",
            }}
          />
          <button
            type="submit"
            style={{
              padding: "0.75rem 1rem",
              backgroundColor: "#3B82F6",
              color: "#FFFFFF",
              borderRadius: "0.5rem",
              border: "none",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "background-color 0.3s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#2563EB")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#3B82F6")}
          >
            Send
          </button>
        </form>
      </div>
    </>
  );
};

export default Chatbot;
