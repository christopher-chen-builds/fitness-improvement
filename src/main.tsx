import { createRoot } from "react-dom/client";
import { validateConfig } from "@/lib/config";
import App from "./App.tsx";
import "./index.css";

// Fail fast if required env vars are missing
validateConfig();

createRoot(document.getElementById("root")!).render(<App />);
