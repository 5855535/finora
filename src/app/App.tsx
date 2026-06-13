import { useState, useEffect, Suspense, lazy } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "../firebase";

import { Landing } from "./components/landing/Landing";
import { Login } from "./components/auth/Login";
import { Register } from "./components/auth/Register";
import { ForgotPassword } from "./components/auth/ForgotPassword";
import { AppLayout } from "./components/layout/AppLayout";

// Lazy load de todas las páginas internas
const Dashboard = lazy(() => import("./components/dashboard/Dashboard").then(m => ({ default: m.Dashboard })));
const Transactions = lazy(() => import("./components/transactions/Transactions").then(m => ({ default: m.Transactions })));
const Subscriptions = lazy(() => import("./components/subscriptions/Subscriptions").then(m => ({ default: m.Subscriptions })));
const Budgets = lazy(() => import("./components/budgets/Budgets").then(m => ({ default: m.Budgets })));
const Goals = lazy(() => import("./components/goals/Goals").then(m => ({ default: m.Goals })));
const Statistics = lazy(() => import("./components/statistics/Statistics").then(m => ({ default: m.Statistics })));
const Alerts = lazy(() => import("./components/alerts/Alerts").then(m => ({ default: m.Alerts })));
const Settings = lazy(() => import("./components/settings/Settings").then(m => ({ default: m.Settings })));

type Screen = "landing" | "login" | "register" | "forgot" | "app";

type AppPage =
  | "dashboard"
  | "transactions"
  | "subscriptions"
  | "budgets"
  | "goals"
  | "statistics"
  | "alerts"
  | "settings";

export default function App() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [appPage, setAppPage] = useState<AppPage>("dashboard");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.documentElement.classList.add("dark");
    localStorage.setItem("darkMode", "true");
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      (window as any).deferredPrompt = e;
    };
    const handleAppInstalled = () => {
      (window as any).deferredPrompt = null;
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setScreen(currentUser ? "app" : "landing");
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = () => {
    setScreen("app");
    setAppPage("dashboard");
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  // ==================== PANTALLA DE CARGA ====================
  if (loading) {
    return <SplashScreen />;
  }

  // ==================== PANTALLAS ====================
  if (screen === "landing") {
    return (
      <Landing
        onGetStarted={() => setScreen("register")}
        onLogin={() => setScreen("login")}
      />
    );
  }

  if (screen === "login") {
    return (
      <Login
        onLogin={handleLogin}
        onGoRegister={() => setScreen("register")}
        onGoForgot={() => setScreen("forgot")}
      />
    );
  }

  if (screen === "register") {
    return (
      <Register onRegister={handleLogin} onGoLogin={() => setScreen("login")} />
    );
  }

  if (screen === "forgot") {
    return <ForgotPassword onBack={() => setScreen("login")} />;
  }

  // App protegida
  return (
    <AppLayout
      currentPage={appPage}
      onNavigate={(page) => setAppPage(page as AppPage)}
      onLogout={handleLogout}
      user={user}
    >
      <Suspense fallback={<PageLoader />}>
        {appPage === "dashboard" && (
          <Dashboard onNavigate={(page) => setAppPage(page as AppPage)} />
        )}
        {appPage === "transactions" && <Transactions />}
        {appPage === "subscriptions" && <Subscriptions />}
        {appPage === "budgets" && <Budgets />}
        {appPage === "goals" && <Goals />}
        {appPage === "statistics" && <Statistics />}
        {appPage === "alerts" && <Alerts />}
        {appPage === "settings" && <Settings />}
      </Suspense>
    </AppLayout>
  );
}

// ==================== PANTALLA DE CARGA INICIAL (minimalista) ====================
function SplashScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center">
          <span className="text-2xl font-bold text-white">F</span>
        </div>
        <div className="flex gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: "0ms" }} />
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: "150ms" }} />
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}

// ==================== LOADER PARA PÁGINAS LAZY ====================
function PageLoader() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="flex gap-1.5">
        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "0ms" }} />
        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "150ms" }} />
        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  );
}