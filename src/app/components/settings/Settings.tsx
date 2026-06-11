import { useState } from "react";
import { Card } from "../ui/Card";
import { useAuth } from "../../hooks/useAuth";
import { auth } from "../../../firebase";
import {
  signOut,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser,
} from "firebase/auth";

export function Settings() {
  const { user } = useAuth();
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      alert("Completa ambos campos");
      return;
    }
    if (newPassword.length < 6) {
      alert("La nueva contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);
    try {
      const credential = EmailAuthProvider.credential(
        user!.email!,
        currentPassword,
      );
      await reauthenticateWithCredential(user!, credential);
      await updatePassword(user!, newPassword);
      alert("✅ Contraseña actualizada correctamente");
      setCurrentPassword("");
      setNewPassword("");
      setShowPasswordSection(false);
    } catch (error: any) {
      alert("Error: " + error.message);
    }
    setLoading(false);
  };

  const handleDeleteAccount = async () => {
    if (!confirm("⚠️ ¿Estás seguro? Esta acción es irreversible.")) return;
    if (!confirm("¿Última confirmación? Se perderán todos tus datos.")) return;

    try {
      await deleteUser(user!);
      alert("Cuenta eliminada");
    } catch (error: any) {
      alert("Error: " + error.message);
    }
  };

  const handleLogout = async () => {
    if (confirm("¿Cerrar sesión?")) {
      await signOut(auth);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Ajustes</h1>

      {/* Cuenta */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Información de Cuenta</h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Correo electrónico</p>
            <p className="font-medium">{user?.email}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Nombre</p>
            <p className="font-medium">
              {user?.displayName || user?.email?.split("@")[0] || "Usuario"}
            </p>
          </div>
        </div>
      </Card>

      {/* Cambiar Contraseña */}
      <Card className="p-6">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-semibold">Cambiar Contraseña</h2>
          <button
            onClick={() => setShowPasswordSection(!showPasswordSection)}
            className="text-primary text-sm hover:underline"
          >
            {showPasswordSection ? "Cancelar" : "Cambiar"}
          </button>
        </div>

        {showPasswordSection && (
          <div className="space-y-4">
            <input
              type="password"
              placeholder="Contraseña actual"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border bg-card"
            />
            <input
              type="password"
              placeholder="Nueva contraseña"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border bg-card"
            />
            <button
              onClick={handleChangePassword}
              className="w-full py-3 bg-primary text-white rounded-xl font-medium"
            >
              Actualizar Contraseña
            </button>
          </div>
        )}
      </Card>

      {/* Eliminar Cuenta */}
      <Card className="p-6 border-red-300">
        <h2 className="text-xl font-semibold text-red-600 mb-3">
          Eliminar Cuenta
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Esta acción es permanente y eliminará todos tus datos.
        </p>
        <button
          onClick={handleDeleteAccount}
          className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-medium"
        >
          Eliminar mi cuenta permanentemente
        </button>
      </Card>

      {/* Cerrar Sesión */}
      <Card className="p-6">
        <button
          onClick={handleLogout}
          className="w-full py-4 text-red-600 hover:bg-red-50 border border-red-200 rounded-2xl font-medium"
        >
          Cerrar Sesión
        </button>
      </Card>
    </div>
  );
}
