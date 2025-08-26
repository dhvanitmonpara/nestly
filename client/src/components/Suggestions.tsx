import axios from "axios";
import { useEffect, useState } from "react";
import env from "../conf/env";
import { toast } from "sonner";

function Suggestions({
  lastMessage,
  handleSend,
  isTyping,
}: {
  lastMessage: string;
  handleSend: (msg: string) => void;
  isTyping: boolean;
}) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const getReplySuggestions = async () => {
    if (!lastMessage) return; // don't fetch if empty

    try {
      setLoading(true);
      const res = await axios.post(
        `${env.SERVER_ENDPOINT}/messages/suggest`,
        { text: lastMessage },
        { withCredentials: true }
      );

      if (res.status !== 201) {
        toast.error("Failed to get suggestions");
        return;
      }

      setSuggestions(res.data.suggestions);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getReplySuggestions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={`absolute ${
        isTyping ? "bottom-20 mb-2" : "bottom-16"
      } transition-all duration-200 left-0 px-8 w-full flex items-center space-x-2`}
    >
      {loading &&
        Array.from({ length: 3 }).map(() => (
          <p className="h-6 w-40 bg-zinc-800 rounded-md animate-pulse"></p>
        ))}
      {!loading &&
        suggestions?.map((suggestion) => (
          <p
            onClick={() => {
              handleSend(suggestion);
              setSuggestions([]);
            }}
            className="bg-zinc-800 hover:bg-zinc-700/60 cursor-pointer rounded-md px-2 py-1 text-xs"
          >
            {suggestion}
          </p>
        ))}
    </div>
  );
}

export default Suggestions;
