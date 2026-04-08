import { useQuery } from "@tanstack/react-query";
import { projectService } from "@/services/projectService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FolderKanban, MapPin, Calendar, Clock } from "lucide-react";

export default function MyProjects() {
  const { data: projects = [] } = useQuery({ queryKey: ["myProjects"], queryFn: projectService.getMyProjects });

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <FolderKanban className="h-5 w-5 text-primary" />
        <h1 className="text-2xl font-semibold">Mis Proyectos</h1>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map(p => (
          <Card key={p.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-base">{p.name}</CardTitle>
                <Badge variant="secondary">{p.code}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{p.location}</div>
              <div className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{p.start_date}</div>
              {p.distance_from_workshop > 0 && <div>{p.distance_from_workshop} km desde el taller</div>}
              {((p.travel_time_to ?? 0) > 0 || (p.travel_time_from ?? 0) > 0) && (
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  Ida: {p.travel_time_to ?? 0} min · Vuelta: {p.travel_time_from ?? 0} min
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {projects.length === 0 && (
          <p className="text-muted-foreground col-span-full text-center py-12">Aún no tienes proyectos asignados.</p>
        )}
      </div>
    </div>
  );
}
