import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../../firebase";
import { Check } from "lucide-react";
import { AuthLayout, FormInput, SubmitButton } from "./AuthLayout";

interface RegisterProps {
  onRegister: () => void;
  onGoLogin: () => void;
}

export function Register({ onRegister, onGoLogin }: RegisterProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (field: string) => (v: string) => {
    setForm((f) => ({ ...f, [field]: v }));
    setErrors((e) => ({ ...e, [field]: "", general: "" }));
  };

  const requirements = [
    { label: "Al menos 8 caracteres", met: form.password.length >= 8 },
    { label: "Una letra mayúscula", met: /[A-Z]/.test(form.password) },
    { label: "Un número", met: /[0-9]/.test(form.password) },
  ];

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};

    if (!form.name.trim()) newErrors.name = "El nombre es obligatorio";
    if (!form.email) newErrors.email = "El email es obligatorio";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = "Email inválido";

    if (form.password.length < 8) newErrors.password = "Mínimo 8 caracteres";
    if (form.password !== form.confirm)
      newErrors.confirm = "Las contraseñas no coinciden";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Crear usuario en Firebase
      await createUserWithEmailAndPassword(auth, form.email, form.password);

      // Opcional: Podrías guardar el nombre en Firestore más adelante
      onRegister(); // Navega a la aplicación
    } catch (error: any) {
      console.error(error);
      if (error.code === "auth/email-already-in-use") {
        setErrors({ email: "Este email ya está registrado" });
      } else if (error.code === "auth/weak-password") {
        setErrors({ password: "La contraseña es demasiado débil" });
      } else {
        setErrors({ general: "Error al crear la cuenta. Inténtalo de nuevo." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Crea tu cuenta"
      subtitle="Empieza a controlar tus finanzas hoy mismo"
    >
      <div className="space-y-5">
        <FormInput
          label="Nombre completo"
          placeholder="María García"
          value={form.name}
          onChange={set("name")}
          error={errors.name}
        />

        <FormInput
          label="Email"
          type="email"
          placeholder="tu@email.com"
          value={form.email}
          onChange={set("email")}
          error={errors.email}
        />

        <div>
          <FormInput
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={set("password")}
            error={errors.password}
          />

          {form.password && (
            <div className="mt-3 space-y-1.5">
              {requirements.map((r) => (
                <div key={r.label} className="flex items-center gap-2 text-sm">
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0`}
                    style={{ background: r.met ? "#059669" : "var(--muted)" }}
                  >
                    {r.met && <Check size={10} color="white" />}
                  </div>
                  <span
                    style={{
                      color: r.met ? "#059669" : "var(--muted-foreground)",
                      fontSize: "0.8rem",
                    }}
                  >
                    {r.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <FormInput
          label="Confirmar contraseña"
          type="password"
          placeholder="••••••••"
          value={form.confirm}
          onChange={set("confirm")}
          error={errors.confirm}
        />

        {errors.general && (
          <p className="text-sm text-center" style={{ color: "#ef4444" }}>
            {errors.general}
          </p>
        )}

        <SubmitButton loading={loading} onClick={handleSubmit}>
          Crear cuenta gratuita
        </SubmitButton>

        <p
          className="text-xs text-center"
          style={{ color: "var(--muted-foreground)", lineHeight: 1.5 }}
        >
          Al registrarte aceptas nuestros{" "}
          <a href="#" style={{ color: "var(--primary)" }}>
            Términos de servicio
          </a>{" "}
          y{" "}
          <a href="#" style={{ color: "var(--primary)" }}>
            Política de privacidad
          </a>
          .
        </p>

        <p
          className="text-center text-sm"
          style={{ color: "var(--muted-foreground)" }}
        >
          ¿Ya tienes cuenta?{" "}
          <button
            onClick={onGoLogin}
            className="font-semibold hover:underline"
            style={{ color: "var(--primary)" }}
          >
            Iniciar sesión
          </button>
        </p>
      </div>
    </AuthLayout>
  );
}
