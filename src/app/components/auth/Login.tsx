import { useState } from "react";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../../../firebase";
import { AuthLayout, FormInput, SubmitButton } from "./AuthLayout";

interface LoginProps {
  onLogin: () => void;
  onGoRegister: () => void;
  onGoForgot: () => void;
}

export function Login({ onLogin, onGoRegister, onGoForgot }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};

    if (!email) newErrors.email = "El email es obligatorio";
    else if (!/\S+@\S+\.\S+/.test(email))
      newErrors.email = "Introduce un email válido";

    if (!password) newErrors.password = "La contraseña es obligatoria";
    else if (password.length < 6) newErrors.password = "Mínimo 6 caracteres";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await signInWithEmailAndPassword(auth, email, password);
      onLogin();
    } catch (error: any) {
      console.error(error);
      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password"
      ) {
        setErrors({ general: "Email o contraseña incorrectos" });
      } else if (error.code === "auth/too-many-requests") {
        setErrors({ general: "Demasiados intentos. Inténtalo más tarde." });
      } else {
        setErrors({ general: "Error al iniciar sesión. Inténtalo de nuevo." });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrors({});

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });

      await signInWithPopup(auth, provider);
      onLogin(); // Navega a la aplicación
    } catch (error: any) {
      console.error(error);
      if (error.code === "auth/popup-blocked") {
        setErrors({
          general: "Pop-up bloqueado. Por favor, permite ventanas emergentes.",
        });
      } else if (error.code === "auth/cancelled-popup-request") {
        // Usuario cerró el popup, no es error
      } else {
        setErrors({
          general: "Error al iniciar sesión con Google. Inténtalo de nuevo.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Bienvenido de nuevo"
      subtitle="Inicia sesión en tu cuenta de Finora"
    >
      <div className="space-y-5">
        <FormInput
          label="Email"
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(v) => {
            setEmail(v);
            setErrors((e) => ({ ...e, email: "", general: "" }));
          }}
          error={errors.email}
        />

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label
              className="text-sm font-semibold"
              style={{ color: "var(--foreground)" }}
            >
              Contraseña
            </label>
            <button
              onClick={onGoForgot}
              className="text-sm font-medium hover:underline"
              style={{ color: "var(--primary)" }}
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrors((er) => ({ ...er, password: "", general: "" }));
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="w-full px-3.5 py-2.5 rounded-lg border outline-none transition-all text-base"
            style={{
              background: "var(--card)",
              borderColor: errors.password ? "#ef4444" : "var(--border)",
              color: "var(--foreground)",
            }}
          />
          {errors.password && (
            <p className="text-xs mt-1" style={{ color: "#ef4444" }}>
              {errors.password}
            </p>
          )}
        </div>

        {errors.general && (
          <p className="text-sm text-center" style={{ color: "#ef4444" }}>
            {errors.general}
          </p>
        )}

        <SubmitButton loading={loading} onClick={handleSubmit}>
          Iniciar sesión
        </SubmitButton>

        {/* Separador */}
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div
              className="w-full border-t"
              style={{ borderColor: "var(--border)" }}
            />
          </div>
          <div className="relative flex justify-center">
            <span
              className="px-3 text-xs"
              style={{
                background: "var(--background)",
                color: "var(--muted-foreground)",
              }}
            >
              o continúa con
            </span>
          </div>
        </div>

        {/* Botón Google REAL */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-2.5 rounded-lg border font-medium text-sm flex items-center justify-center gap-2 hover:bg-muted transition-colors disabled:opacity-70"
          style={{
            borderColor: "var(--border)",
            color: "var(--foreground)",
            background: "var(--card)",
          }}
        >
          <img
            src="https://www.google.com/favicon.ico"
            alt="Google"
            className="w-5 h-5"
          />
          Continuar con Google
        </button>

        <p
          className="text-center text-sm"
          style={{ color: "var(--muted-foreground)" }}
        >
          ¿No tienes cuenta?{" "}
          <button
            onClick={onGoRegister}
            className="font-semibold hover:underline"
            style={{ color: "var(--primary)" }}
          >
            Regístrate gratis
          </button>
        </p>
      </div>
    </AuthLayout>
  );
}
