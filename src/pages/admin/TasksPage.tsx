import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { taskService } from "@/services/taskService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ListTodo } from "lucide-react";



export default function TasksPage() {
  const { data: tasks = [] } = useQuery({ queryKey: ["tasks"], queryFn: taskService.getTasks });

  const categories = useMemo(() => {
    const cats = new Set(tasks.map(t => t.category));
    return Array.from(cats);
  }, [tasks]);

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <ListTodo className="h-5 w-5 text-primary" />
        <h1 className="text-2xl font-semibold">Tareas</h1>
      </div>
      <div className="space-y-6">
        {categories.map(cat => {
          const categoryTasks = tasks.filter(t => t.category === cat);
          return (
            <Card key={cat}>
              <CardHeader className="pb-2"><CardTitle className="text-base">{cat}</CardTitle></CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">Código</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Roles</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categoryTasks.map(t => (
                      <TableRow key={t.code}>
                        <TableCell><Badge variant="secondary">{t.code}</Badge></TableCell>
                        <TableCell>{t.name}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {t.allowed_roles.map(r => <Badge key={r} variant="outline" className="text-xs">{r}</Badge>)}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
