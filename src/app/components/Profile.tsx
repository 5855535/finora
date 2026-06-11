import { LogOut } from "lucide-react";
import { Card } from "../components/ui/Card";
import { useAuth } from "../hooks/useAuth";
import { auth } from "../../firebase";
import { signOut } from "firebase/auth";

export function Profile() {
  const { user, loading } = useAuth();

  const handleLogout = async () => {
    if (confirm("¿Cerrar sesión?")) {
      await signOut(auth);
    }
  };

  if (loading) return <div className="p-8 text-center">Cargando perfil...</div>;
  if (!user) return <div className="p-8 text-center">No hay sesión activa</div>;

  return (
    <div className="max-w-md mx-auto p-6">
      <Card className="p-8 text-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-4xl border-4 border-background shadow">
          {(user.email || "U")[0].toUpperCase()}
        </div>

        <h1 className="text-2xl font-bold mb-8">{user.email}</h1>

        <button
          onClick={handleLogout}
          className="w-full py-4 flex items-center justify-center gap-3 text-red-600 hover:bg-red-50 border border-red-200 rounded-2xl font-medium"
        >
          <LogOut size={20} />
          Cerrar Sesión
        </button>
      </Card>
    </div>
  );
}
