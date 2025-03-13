import { FirebaseService } from "./modules/firebaseService";
import { renderTeamMembers, renderTasks } from "./modules/ui";

document.addEventListener("DOMContentLoaded", () => {
  fetchTeamMembers();
  fetchTasks();
});

async function fetchTeamMembers() {
  const teamMembers = await FirebaseService.fetchCollection("members");
  localStorage.setItem('teamMembers', JSON.stringify(teamMembers));
  renderTeamMembers(teamMembers);
}

async function fetchTasks() {
  const tasks = await FirebaseService.fetchCollection("assignments");
  renderTasks(tasks);
}

(window as any).addTask = async function() {
  console.log("Add Task button clicked");
  const title = (document.getElementById("taskTitle") as HTMLInputElement).value;
  const description = (document.getElementById("taskDescription") as HTMLTextAreaElement).value;
  const category = (document.getElementById("taskCategory") as HTMLSelectElement).value;
  if (title && description && category) {
    await FirebaseService.addDocument("assignments", { title, description, category, status: "new", timestamp: new Date().toISOString() });
    fetchTasks();
  }
};
