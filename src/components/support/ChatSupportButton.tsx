
import { useState } from "react";
import { MessageCircle } from "lucide-react";
import ChatSupport from "./ChatSupport";
import { motion, AnimatePresence } from "framer-motion";

const ChatSupportButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <motion.button
        className="fixed bottom-6 right-6 z-40 p-4 rounded-full bg-primary shadow-lg text-white"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleChat}
        aria-label="Open chat support"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <MessageCircle size={24} />
      </motion.button>

      <AnimatePresence>
        {isOpen && <ChatSupport onClose={toggleChat} />}
      </AnimatePresence>
    </>
  );
};

export default ChatSupportButton;
