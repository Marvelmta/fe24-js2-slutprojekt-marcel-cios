import { FirebaseService } from "./firebaseService";
import { renderTeamMembers, renderTasks, TeamMember, Task } from "./ui";

document.addEventListener("DOMContentLoaded", () => {
  fetchTeamMembers();
  fetchTasks();

  document.getElementById("addMemberButton")?.addEventListener("click", addMember);
  document.getElementById("addTaskButton")?.addEventListener("click", addTask);

  document.getElementById("filterMember")?.addEventListener("change", () => fetchTasks());
  document.getElementById("filterCategory")?.addEventListener("change", () => fetchTasks());
  document.getElementById("sortOrder")?.addEventListener("change", () => fetchTasks());
});

async function fetchTeamMembers() {
  const teamMembers = await FirebaseService.fetchCollection("members");
  const validTeamMembers: TeamMember[] = teamMembers.map(member => ({
    id: member.id,
    name: member.name || '',
    roles: member.roles || []
  }));
  localStorage.setItem('teamMembers', JSON.stringify(validTeamMembers));

  renderTeamMembers(validTeamMembers);
}

export async function fetchTasks() {
  const tasks = await FirebaseService.fetchCollection("assignments");
  const validTasks: Task[] = tasks.map(task => ({
    id: task.id,
    title: task.title || '',
    description: task.description || '',
    category: task.category || '',
    status: task.status || '',
    timestamp: task.timestamp || '',
    assigned: task.assigned || ''
  }));
  renderTasks(validTasks);
}

async function addMember() {
  const name = (document.getElementById("memberName") as HTMLInputElement).value.trim();
  const roleCheckboxes = document.querySelectorAll<HTMLInputElement>('input[name="roles"]:checked');
  const roles = Array.from(roleCheckboxes).map(checkbox => checkbox.value);

  if (!name) {
    alert("Please enter a member name.");
    return;
  }

  if (roles.length === 0) {
    alert("Please select at least one role.");
    return;
  }

  try {
    setLoading(true, "addMemberButton");
    await FirebaseService.addDocument("members", { name, roles });

    fetchTeamMembers(); 
  } catch (error) {
    console.error("Failed to add member:", error);
  } finally {
    setLoading(false, "addMemberButton");
  }
}

async function addTask() {
  const title = (document.getElementById("taskTitle") as HTMLInputElement).value;
  const description = (document.getElementById("taskDescription") as HTMLTextAreaElement).value;
  const category = (document.getElementById("taskCategory") as HTMLSelectElement).value;
  if (title && description && category) {
    try {
      setLoading(true, "addTaskButton");
      await FirebaseService.addDocument("assignments", { title, description, category, status: "new", timestamp: new Date().toISOString() });
      fetchTasks();
    } catch (error) {
      console.error("Failed to add task:", error);
    } finally {
      setLoading(false, "addTaskButton");
    }
  }
}

function setLoading(isLoading: boolean, buttonId: string) {
  const button = document.getElementById(buttonId) as HTMLButtonElement;
  if (button) {
    button.disabled = isLoading;
    button.textContent = isLoading ? "Loading..." : buttonId === "addMemberButton" ? "Add Member" : "Add Task";
  }
}

export async function updateTaskStatus(id: string, status: string, assignedId?: string) {
  const updateData: any = { status };
  if (assignedId) {
    updateData.assigned = assignedId;
  }
  await FirebaseService.updateDocument("assignments", id, updateData);
  fetchTasks();
}

export async function deleteCompletedTask(id: string) {
  await FirebaseService.deleteDocument("assignments", id);
  fetchTasks();
}

(window as any).addTask = addTask;
