import { User, Project, TimeEntry } from "./constants";

const KEYS = {
  users: "wt_users",
  projects: "wt_projects",
  entries: "wt_entries",
  currentUser: "wt_current_user",
};

// Generic localStorage helpers
function getItems<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

function setItems<T>(key: string, items: T[]) {
  localStorage.setItem(key, JSON.stringify(items));
}

// Users
export const getUsers = () => getItems<User>(KEYS.users);
export const setUsers = (users: User[]) => setItems(KEYS.users, users);
export const addUser = (user: User) => {
  const users = getUsers();
  users.push(user);
  setUsers(users);
};
export const updateUser = (user: User) => {
  const users = getUsers().map(u => u.id === user.id ? user : u);
  setUsers(users);
};
export const deleteUser = (id: string) => {
  setUsers(getUsers().filter(u => u.id !== id));
};

// Projects
export const getProjects = () => getItems<Project>(KEYS.projects);
export const setProjects = (projects: Project[]) => setItems(KEYS.projects, projects);
export const addProject = (project: Project) => {
  const projects = getProjects();
  projects.push(project);
  setProjects(projects);
};
export const updateProject = (project: Project) => {
  const projects = getProjects().map(p => p.id === project.id ? project : p);
  setProjects(projects);
};
export const deleteProject = (id: string) => {
  setProjects(getProjects().filter(p => p.id !== id));
};

// Time entries
export const getTimeEntries = () => getItems<TimeEntry>(KEYS.entries);
export const setTimeEntries = (entries: TimeEntry[]) => setItems(KEYS.entries, entries);
export const addTimeEntry = (entry: TimeEntry) => {
  const entries = getTimeEntries();
  entries.push(entry);
  setTimeEntries(entries);
};

// Current user session
export const getCurrentUser = (): (User & { isAdmin?: boolean }) | null => {
  try {
    return JSON.parse(localStorage.getItem(KEYS.currentUser) || "null");
  } catch {
    return null;
  }
};
export const setCurrentUser = (user: (User & { isAdmin?: boolean }) | null) => {
  localStorage.setItem(KEYS.currentUser, JSON.stringify(user));
};

// Seed default admin
export function seedDefaults() {
  const users = getUsers();
  if (users.length === 0) {
    addUser({
      id: "admin-1",
      name: "Administrator",
      homeLocation: "Office",
      role: "Mechanical Engineers",
      password: "admin123",
    });
  }
  // Seed non-productive project
  const projects = getProjects();
  if (!projects.find(p => p.code === "000")) {
    addProject({
      id: "proj-nonprod",
      name: "Non Productive Hours",
      code: "000",
      location: "N/A",
      distanceFromWorkshop: 0,
      startDate: new Date().toISOString().split("T")[0],
      assignedUsers: [],
      type: "non-productive",
    });
  }
}
