import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { Navbar, Footer } from "./components/Navbar";
import { AttendeePage } from "./pages/AttendeePage";
import { VendorPage } from "./pages/VendorPage";
import { AdminPage } from "./pages/AdminPage";
import { SuperAdminPage } from "./pages/SuperAdminPage";

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-zinc-50 flex flex-col text-zinc-900 font-sans antialiased">
          
          {/* Main Top Header Navigation */}
          <Navbar />

          {/* Main Content Area Routed Pages */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-6 md:py-8">
            <Routes>
              <Route path="/" element={<AttendeePage />} />
              <Route path="/vendor" element={<VendorPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/super-admin" element={<SuperAdminPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Clean Production Footer */}
          <Footer />
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}
