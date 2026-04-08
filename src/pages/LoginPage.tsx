import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const { login, loginAsAdmin } = useAuth();
  const [tab, setTab] = useState<"user" | "admin">("user");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tab === "admin") {
      const success = await loginAsAdmin(password);
      if (!success) {
        toast.error("Credenciales de administrador incorrectas");
      }
    } else {
      const success = await login(name, password);
      if (!success) {
        toast.error("Credenciales inválidas");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <Clock className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-xl">Control Horario</CardTitle>
          <CardDescription>Inicia sesión para registrar tus horas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex mb-4 rounded-lg bg-muted p-1 gap-1">
            <button
              onClick={() => setTab("user")}
              className={`flex-1 text-sm py-2 rounded-md font-medium transition-colors ${tab === "user" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
            >
              Empleado
            </button>
            <button
              onClick={() => setTab("admin")}
              className={`flex-1 text-sm py-2 rounded-md font-medium transition-colors ${tab === "admin" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
            >
              Administrador
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            {tab === "user" && (
              <Input
                placeholder="Nombre"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            )}
            <Input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <Button type="submit" className="w-full">
              Iniciar Sesión
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
