import { useState } from "react";
import { ArrowLeft, Mail } from "lucide-react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../../firebase";
import { AuthLayout, FormInput, SubmitButton } from "./AuthLayout";

interface ForgotPasswordProps {
  onBack: () => void;
}

export function ForgotPassword({ onBack }: ForgotPasswordProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async () => {
    if (!email) {
      setError("El email es obligatorio");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Introduce un email válido");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
      setSuccessMessage("¡Enlace enviado correctamente!");
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/user-not-found") {
        setError("No existe una cuenta con este email.");
      } else if (err.code === "auth/invalid-email") {
        setError("El email no es válido.");
      } else {
        setError("Error al enviar el enlace. Inténtalo de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Recuperar contraseña"
      subtitle="Te enviaremos un enlace para restablecer tu contraseña"
    >
      {!sent ? (
        <div className="space-y-5">
          <FormInput
            label="Email"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(v) => {
              setEmail(v);
              setError("");
            }}
            error={error}
          />

          <SubmitButton loading={loading} onClick={handleSubmit}>
            Enviar enlace de recuperación
          </SubmitButton>

          <button
            onClick={onBack}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border font-medium transition-colors hover:bg-muted"
            style={{
              borderColor: "var(--border)",
              color: "var(--muted-foreground)",
              background: "transparent",
            }}
          >
            <ArrowLeft size={16} /> Volver al inicio de sesión
          </button>
        </div>
      ) : (
        <div className="text-center space-y-6 py-4">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
            style={{ background: "#d1fae5" }}
          >
            <Mail size={36} style={{ color: "#059669" }} />
          </div>

          <div>
            <h3
              className="text-xl font-semibold mb-2"
              style={{ color: "var(--foreground)" }}
            >
              ¡Email enviado!
            </h3>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--muted-foreground)" }}
            >
              Hemos enviado un enlace de recuperación a <strong>{email}</strong>
              .<br />
              Revisa tu bandeja de entrada (y spam).
            </p>
          </div>

          <button
            onClick={onBack}
            className="w-full py-3 rounded-lg font-semibold text-sm transition-colors"
            style={{
              background: "var(--primary)",
              color: "#fff",
              border: "none",
            }}
          >
            Volver al inicio de sesión
          </button>
        </div>
      )}
    </AuthLayout>
  );
}
