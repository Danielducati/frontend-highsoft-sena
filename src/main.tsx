import './firebase.js'  
import { createRoot } from "react-dom/client";
import App from "./app/App";
import "./shared/styles/index.css";
import "./shared/styles/responsive.css";



  createRoot(document.getElementById("root")!).render(<App />);
