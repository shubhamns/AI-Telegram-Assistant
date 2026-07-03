import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { ConfigProvider } from "antd-mobile";
import enUS from "antd-mobile/es/locales/en-US";
import App from "@/App";
import "antd-mobile/es/global";
import "@/index.css";
const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30000 } } });
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ConfigProvider locale={enUS}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ConfigProvider>
    </QueryClientProvider>
  </StrictMode>
);
