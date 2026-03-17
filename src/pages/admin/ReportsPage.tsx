import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { timeEntryService } from "@/services/timeEntryService";
import { projectService } from "@/services/projectService";
import { taskService } from "@/services/taskService";
/* We need to use fetchApi directly or add a user fetching service to `api.ts` since admins can fetch users. 
   Actually, `src/services/authService.ts` has Auth, there is no generic UserService yet, but since the requirement 
   did not explicitly ask for robust user crud beyond login, let's implement a simple user getter just here or bypass.
   Wait, the backend `time_entries` model does NOT join `user.name` unless we do a custom schema.
   Ah, the generic reporting schema does, but `get_all_entries` returns `TimeEntryResponse` without user name, just `user_id`.
   Let's add a `userService.ts` or fetch it if needed. Or just show the `user_id` as the requirements had it right now.
   Actually, the user needs User info. In Phase 4 we didn't write an endpoint for `GET /users`. We can fetch reportService!
*/
import { reportService } from "@/services/reportService";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileBarChart } from "lucide-react";

export default function ReportsPage() {
  const { data: rawEntries = [] } = useQuery({ queryKey: ["adminEntries"], queryFn: timeEntryService.getAllEntries });
  const { data: projects = [] } = useQuery({ queryKey: ["adminProjects"], queryFn: projectService.getAllProjects });
  const { data: tasks = [] } = useQuery({ queryKey: ["tasks"], queryFn: taskService.getTasks });
  const { data: userReports = [] } = useQuery({ queryKey: ["reportUsers"], queryFn: () => reportService.getUserReport() });

  const entries = useMemo(() => {
    return [...rawEntries].sort((a, b) => b.date.localeCompare(a.date));
  }, [rawEntries]);

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <FileBarChart className="h-5 w-5 text-primary" />
        <h1 className="text-2xl font-semibold">Informes</h1>
      </div>
      <Card>
        <CardContent className="p-0 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Empleado</TableHead>
                <TableHead>Proyecto</TableHead>
                <TableHead>Código Tarea</TableHead>
                <TableHead>Nombre Tarea</TableHead>
                <TableHead className="text-right">Horas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map(e => {
                const user = userReports.find(u => u.user_id === e.user_id);
                const project = projects.find(p => p.id === e.project_id);
                const task = tasks.find(t => t.id === e.task_id);
                return (
                  <TableRow key={e.id}>
                    <TableCell>{e.date}</TableCell>
                    <TableCell>{user?.name || e.user_id.split("-")[0]}</TableCell>
                    <TableCell>{project ? `[${project.code}] ${project.name}` : "—"}</TableCell>
                    <TableCell>{task?.code}</TableCell>
                    <TableCell>{task?.name || "—"}</TableCell>
                    <TableCell className={e.hours > 8 ? "text-right font-bold text-destructive" : "text-right"}>
                      {e.hours}h
                    </TableCell>
                  </TableRow>
                );
              })}
              {entries.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-12">Aún no hay registros</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
