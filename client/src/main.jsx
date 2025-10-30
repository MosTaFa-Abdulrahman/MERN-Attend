import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Toaster } from "react-hot-toast";

// Context && RTKQ
import { AuthContextProvider } from "./context/AuthContext.jsx";
import { Provider } from "react-redux";
import { store } from "./store/store.js";

createRoot(document.getElementById("root")).render(
  <AuthContextProvider>
    <Provider store={store}>
      <App />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 2000,
        }}
      />
    </Provider>
  </AuthContextProvider>
);
