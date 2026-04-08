import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/services/userService";
import { USER_ROLES } from "@/data/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Users, Plus, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";

export default function UsersPage() {
  const queryClient = useQueryClient();
  const { data: users = [] } = useQuery({ queryKey: ["users"], queryFn: userService.getUsers });

  const createMutation = useMutation({
    mutationFn: userService.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Usuario creado");
      setOpen(false);
      resetForm();
    },
    onError: () => toast.error("Error al crear usuario")
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => userService.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Usuario actualizado");
      setOpen(false);
      resetForm();
    },
    onError: () => toast.error("Error al actualizar usuario")
  });

  const deleteMutation = useMutation({
    mutationFn: userService.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Usuario eliminado");
    },
    onError: () => toast.error("Error al eliminar usuario")
  });

  const [open, setOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [employeeCode, setEmployeeCode] = useState("");
  const [name, setName] = useState("");
  const [homeLocation, setHomeLocation] = useState("");
  const [role, setRole] = useState<string>("");
  const [password, setPassword] = useState("");

  const resetForm = () => {
    setEditingUserId(null);
    setEmployeeCode("");
    setName("");
    setHomeLocation("");
    setRole("");
    setPassword("");
  };

  const handleOpenCreate = () => {
    resetForm();
    setOpen(true);
  };

  const handleOpenEdit = (user: any) => {
    setEditingUserId(user.id);
    setEmployeeCode(user.employee_code);
    setName(user.name);
    setHomeLocation(user.home_location || "");
    setRole(user.role);
    setPassword(""); // Clear password field for security
    setOpen(true);
  };

  const handleSubmit = () => {
    if (!name || !role) return;
    
    if (editingUserId) {
      const data: any = { name, home_location: homeLocation, role };
      if (password) data.password = password;
      updateMutation.mutate({ id: editingUserId, data });
    } else {
      if (!employeeCode || !password) return;
      createMutation.mutate({
        employee_code: employeeCode,
        name,
        home_location: homeLocation,
        role,
        password,
      });
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary shrink-0" />
          <h1 className="text-2xl font-semibold">Usuarios</h1>
        </div>
        <Button size="sm" className="gap-1.5 w-full sm:w-auto" onClick={handleOpenCreate}>
          <Plus className="h-4 w-4" />Añadir Usuario
        </Button>
      </div>

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if(!v) resetForm(); }}>
        <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingUserId ? "Editar Usuario" : "Crear Usuario"}</DialogTitle></DialogHeader>
          <div className="space-y-3 pt-4">
            <div>
              <Label>Código Empleado</Label>
              <Input value={employeeCode} onChange={e => setEmployeeCode(e.target.value)} disabled={!!editingUserId} />
            </div>
            <div><Label>Nombre</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
            <div><Label>Domicilio</Label><Input value={homeLocation} onChange={e => setHomeLocation(e.target.value)} /></div>
            <div>
              <Label>Rol</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger><SelectValue placeholder="Seleccionar rol" /></SelectTrigger>
                <SelectContent>
                  {USER_ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Contraseña {editingUserId && "(dejar en blanco para no cambiar)"}</Label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <Button onClick={handleSubmit} className="w-full mt-4" disabled={createMutation.isPending || updateMutation.isPending}>
              {editingUserId ? "Actualizar Usuario" : "Crear Usuario"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mobile view */}
      <div className="md:hidden space-y-3">
        {users.map(u => (
          <div key={u.id} className="rounded-lg border bg-card p-4 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">{u.name}</p>
              <p className="text-xs text-muted-foreground">{u.employee_code}</p>
              <span className="inline-block mt-1 text-xs bg-secondary rounded-full px-2 py-0.5">{u.role}</span>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => handleOpenEdit(u)}>
                <Edit className="h-4 w-4 text-primary" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => deleteMutation.mutate(u.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop view */}
      <Card className="hidden md:block">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Domicilio</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead colSpan={2} className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map(u => (
                <TableRow key={u.id}>
                  <TableCell className="font-mono text-xs">{u.employee_code}</TableCell>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell>{u.home_location}</TableCell>
                  <TableCell><span className="text-xs bg-secondary px-2 py-1 rounded-full">{u.role}</span></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(u)}>
                        <Edit className="h-4 w-4 text-primary" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(u.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
