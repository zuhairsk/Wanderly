import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState } from "react";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Explore from "@/pages/explore";
import AttractionDetail from "@/pages/attraction-detail";
import Profile from "@/pages/profile";
import Admin from "@/pages/admin";
import Planner from "@/pages/planner";
import AboutUs from "@/pages/about-us";
import Contact from "@/pages/contact";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import AuthModal from "@/components/auth-modal";
import ChatButton from "@/components/chat-button";

function Router() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  const handleAuthClick = (mode: "login" | "signup") => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleSwitchMode = () => {
    setAuthMode((prev) => (prev === "login" ? "signup" : "login"));
  };

  return (
    <>
      <Navbar onAuthClick={handleAuthClick} />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/explore" component={Explore} />
        <Route path="/planner" component={Planner} />
        <Route path="/attraction/:id" component={AttractionDetail} />
        <Route path="/profile" component={Profile} />
        <Route path="/admin" component={Admin} />
        <Route path="/about-us" component={AboutUs} />
        <Route path="/contact" component={Contact} />
        <Route component={NotFound} />
      </Switch>
      <Footer />
      <ChatButton />
      <AuthModal
        isOpen={authModalOpen}
        mode={authMode}
        onClose={() => setAuthModalOpen(false)}
        onSwitchMode={handleSwitchMode}
      />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
