import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "../firebase";

import { Landing } from "./components/landing/Landing";
import { Login } from "./components/auth/Login";
import { Register } from "./components/auth/Register";
import { ForgotPassword } from "./components/auth/ForgotPassword";
import { AppLayout } from "./components/layout/AppLayout";

import { Dashboard } from "./components/dashboard/Dashboard";
import { Transactions } from "./components/transactions/Transactions";
import { Subscriptions } from "./components/subscriptions/Subscriptions";
import { Budgets } from "./components/budgets/Budgets";
import { Goals } from "./components/goals/Goals";
import { Statistics } from "./components/statistics/Statistics";
import { Alerts } from "./components/alerts/Alerts";
import { Settings } from "./components/settings/Settings";

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

  // 1. Forzar modo oscuro permanente
  useEffect(() => {
    document.documentElement.classList.add("dark");
    localStorage.setItem("darkMode", "true");
  }, []);

  // 2. Detector de Instalación PWA (Para depuración)
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Previene el prompt automático de Chrome para manejarlo luego si quieres
      e.preventDefault();
      console.log(
        "✅ PWA DETECTADA: El evento 'beforeinstallprompt' se disparó.",
      );
      console.log(
        "👉 Si ves esto pero no hay botón, es un bug de caché de Chrome. Ejecuta 'chrome://restart'",
      );

      // Guardamos el evento por si quieres crear un botón manual de "Instalar" en el futuro
      (window as any).deferredPrompt = e;
    };

    const handleAppInstalled = () => {
      console.log("🎉 ¡La aplicación se instaló correctamente!");
      (window as any).deferredPrompt = null;
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  // 3. Autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setScreen("app");
      } else {
        setScreen("landing");
      }
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl">
            <span className="text-5xl">💰</span>
          </div>

          <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-6" />

          <h2 className="text-2xl font-semibold text-foreground mb-1">
            Finora
          </h2>
          <p className="text-muted-foreground">Cargando tus finanzas...</p>
        </div>
      </div>
    );
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
    </AppLayout>
  );
}
