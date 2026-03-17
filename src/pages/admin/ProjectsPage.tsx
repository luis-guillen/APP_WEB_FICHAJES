import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectService } from "@/services/projectService";
import { userService } from "@/services/userService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { FolderKanban, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

const TYPE_LABELS: Record<string, string> = {
  standard: "Estándar",
  offer: "Preparación de Oferta",
  "non-productive": "No Productivo",
};

export default function ProjectsPage() {
  const queryClient = useQueryClient();
  const { data: projects = [] } = useQuery({ queryKey: ["adminProjects"], queryFn: projectService.getAllProjects });
  const { data: users = [] } = useQuery({ queryKey: ["users"], queryFn: userService.getUsers });

  const createMutation = useMutation({
    mutationFn: projectService.createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminProjects"] });
      toast.success("Proyecto creado");
      setName(""); setCode(""); setLocation(""); setDistance("0");
      setTravelTo("0"); setTravelFrom("0");
      setSelectedUsers([]); setAssignAll(false); setProjectType("standard");
      setOpen(false);
    },
    onError: () => toast.error("Error al crear proyecto"),
  });

  const deleteMutation = useMutation({
    mutationFn: projectService.deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminProjects"] });
      toast.success("Proyecto eliminado");
    },
    onError: () => toast.error("Error al eliminar proyecto"),
  });

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [location, setLocation] = useState("");
  const [distance, setDistance] = useState("0");
  const [travelTo, setTravelTo] = useState("0");
  const [travelFrom, setTravelFrom] = useState("0");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [assignAll, setAssignAll] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [projectType, setProjectType] = useState<"standard" | "offer" | "non-productive">("standard");

  const handleCreate = () => {
    if (!name || !code) return;
    createMutation.mutate({
      name,
      code,
      location,
      distance_from_workshop: parseFloat(distance) || 0,
      travel_time_to: parseInt(travelTo) || 0,
      travel_time_from: parseInt(travelFrom) || 0,
      start_date: startDate,
      assigned_user_ids: assignAll ? users.map(u => u.id) : selectedUsers,
      type: projectType,
    });
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const toggleUser = (uid: string) => {
    setSelectedUsers(prev => prev.includes(uid) ? prev.filter(x => x !== uid) : [...prev, uid]);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FolderKanban className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-semibold">Proyectos</h1>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" />Añadir Proyecto</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Crear Proyecto</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Tipo</Label>
                <Select value={projectType} onValueChange={(v: "standard" | "offer" | "non-productive") => setProjectType(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Estándar</SelectItem>
                    <SelectItem value="offer">Preparación de Oferta</SelectItem>
                    <SelectItem value="non-productive">No Productivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Nombre del Proyecto</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
              <div><Label>Código del Proyecto</Label><Input value={code} onChange={e => setCode(e.target.value)} placeholder={projectType === "non-productive" ? "000" : ""} /></div>
              <div><Label>Ubicación</Label><Input value={location} onChange={e => setLocation(e.target.value)} /></div>
              <div><Label>Distancia desde el taller (km)</Label><Input type="number" value={distance} onChange={e => setDistance(e.target.value)} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Tiempo de ida (min)</Label><Input type="number" min="0" value={travelTo} onChange={e => setTravelTo(e.target.value)} /></div>
                <div><Label>Tiempo de vuelta (min)</Label><Input type="number" min="0" value={travelFrom} onChange={e => setTravelFrom(e.target.value)} /></div>
              </div>
              <div><Label>Fecha de inicio</Label><Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} /></div>
              <div className="flex items-center gap-3">
                <Switch checked={assignAll} onCheckedChange={setAssignAll} id="assignAll" />
                <Label htmlFor="assignAll">Asignar a todos los usuarios</Label>
              </div>
              {!assignAll && (
                <div className="space-y-1">
                  <Label>Asignar Usuarios</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {users.map(u => (
                      <Badge
                        key={u.id}
                        variant={selectedUsers.includes(u.id) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleUser(u.id)}
                      >
                        {u.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <Button onClick={handleCreate} className="w-full">Crear Proyecto</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Inicio</TableHead>
                <TableHead>Viaje</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map(p => (
                <TableRow key={p.id}>
                  <TableCell><Badge variant="secondary">{p.code}</Badge></TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{p.location}</TableCell>
                  <TableCell>{TYPE_LABELS[p.type] || p.type}</TableCell>
                  <TableCell>{p.start_date}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {(p.travel_time_to || 0) > 0 || (p.travel_time_from || 0) > 0
                      ? `↑${p.travel_time_to ?? 0}′ ↓${p.travel_time_from ?? 0}′`
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
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
