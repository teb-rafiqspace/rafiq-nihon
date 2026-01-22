import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';

export function WelcomeMessage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-8"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
        className="w-20 h-20 bg-gradient-xp rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
      >
        <Bot className="h-10 w-10 text-white" />
      </motion.div>
      
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-xl font-bold mb-2"
      >
        Konnichiwa! 👋
      </motion.h2>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-muted-foreground text-sm max-w-xs mx-auto"
      >
        Saya Rafiq Sensei, asisten AI kamu untuk belajar bahasa Jepang. 
        Tanyakan apa saja tentang bahasa Jepang!
      </motion.p>
    </motion.div>
  );
}
