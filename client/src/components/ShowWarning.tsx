"use client";

import { useEffect, type ReactNode } from "react";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { useNavigate } from "react-router-dom";
import useFeatureStore from "../store/featureStore";

function ShowWarning({ icon, text }: { text: string; icon: ReactNode }) {
  const isDesktop = useMediaQuery("(min-width: 640px)");
  const navigate = useNavigate();
  const setSidebarOpen = useFeatureStore((s) => s.setSidebarOpen);
  useEffect(() => {
    if (!isDesktop) {
      setSidebarOpen(true);
    }
  }, [isDesktop, navigate, setSidebarOpen]);
  return (
    <div className="flex-col flex justify-center items-center space-y-4 h-full text-zinc-500">
      <span className="p-4 bg-zinc-800 rounded-full text-3xl">{icon}</span>
      <p className="px-6 text-center">{text}</p>
      <button
        onClick={() => setSidebarOpen(true)}
        className="sm:hidden bg-zinc-800 px-3 py-1.5 rounded-md hover:text-zinc-300 hover:bg-zinc-700/65 transition-colors cursor-pointer font-semibold"
      >
        Select server
      </button>
    </div>
  );
}

export default ShowWarning;
