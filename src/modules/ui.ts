import { FirebaseService } from "./firebaseService";
import { fetchTasks, deleteCompletedTask } from "./app";

export type Task = {
  id: string;
  title: string;
  description: string;
  category: string;
  assigned?: string;
  status: string;
  timestamp: string;
};

export type TeamMember = {
  id: string;
  name: string;
  roles: string[];
};

export function renderTeamMembers(teamMembers: TeamMember[]) {
  const filterMemberSelect = document.getElementById("filterMember") as HTMLSelectElement;

  if (!filterMemberSelect) {
    console.error('Element with ID "filterMember" not found.');
    return;
  }

  filterMemberSelect.innerHTML = '<option value="">Filter by Member</option>';

  teamMembers.forEach(member => {
    const filterOption = document.createElement("option");
    filterOption.value = member.id;
    filterOption.textContent = member.name;
    filterMemberSelect.appendChild(filterOption);
  });

  console.log("Rendered team members:", teamMembers);
}

export function renderTasks(tasks: Task[]) {
  const columns = { "new": "newTasks", "in progress": "inProgressTasks", "done": "completedTasks" };


Object.entries(columns).forEach(([status, columnId]) => {
  const columnElement = document.getElementById(columnId);
  if (columnElement) {
    columnElement.innerHTML = `<h2>${status === "done" ? "Completed" : capitalizeFirstLetter(status)}</h2>`;
  }
});

  const teamMembers = JSON.parse(localStorage.getItem("teamMembers") || "[]") as TeamMember[];
  const filterMember = (document.getElementById("filterMember") as HTMLSelectElement).value;
  const filterCategory = (document.getElementById("filterCategory") as HTMLSelectElement).value;
  const sortOrder = (document.getElementById("sortOrder") as HTMLSelectElement).value;

  const filteredTasks = tasks.filter(task =>
    (!filterMember || task.assigned === filterMember) && (!filterCategory || task.category === filterCategory)
  );

  const sortedTasks = filteredTasks.sort((a, b) => {
    const timestampA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
    const timestampB = b.timestamp ? new Date(b.timestamp).getTime() : 0;

    if (sortOrder === "timestampDesc") return timestampB - timestampA;
    if (sortOrder === "timestampAsc") return timestampA - timestampB;
    if (sortOrder === "titleAsc") return a.title.localeCompare(b.title);
    if (sortOrder === "titleDesc") return b.title.localeCompare(a.title);
    return 0;
  });

  sortedTasks.forEach(task => {
    const div = document.createElement("div");
    div.classList.add("task");

    const assignedMember = teamMembers.find(member => member.id === task.assigned);
    const assignedName = assignedMember ? assignedMember.name : "Unassigned";

    div.innerHTML = `
      <h3>${task.title}</h3>
      <p>${task.description}</p>
      <p>Category: ${task.category}</p>
      <p>Timestamp: ${formatDate(task.timestamp)}</p>
      <p>Assigned To: ${assignedName}</p>
    `;

    const columnElement = document.getElementById(columns[task.status]);
    if (!columnElement) return;

    if (task.status === "new") {
      const assignSelect = document.createElement("select");
      assignSelect.innerHTML = '<option value="">Assign To</option>';

      teamMembers.forEach(member => {
        if (member.roles.includes(task.category)) {
          const option = document.createElement("option");
          option.value = member.id;
          option.textContent = member.name;
          assignSelect.appendChild(option);
        }
      });

      assignSelect.onchange = () => updateTaskStatus(task.id, "in progress", assignSelect.value);
      div.appendChild(assignSelect);
    } else if (task.status === "in progress") {
      const button = document.createElement("button");
      button.textContent = "Mark as Done";
      button.onclick = () => updateTaskStatus(task.id, "done");
      div.appendChild(button);
    } else if (task.status === "done") {
      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.onclick = () => deleteCompletedTask(task.id);
      div.appendChild(deleteButton);
    }
    columnElement.appendChild(div);
  });
}

function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

//Chat GPT - Ändra formatet på datum och tid
function formatDate(timestamp: string) {
  const date = new Date(timestamp);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

export async function updateTaskStatus(id: string, status: string, assignedId?: string) {
  const updateData: any = { status };
  if (assignedId) updateData.assigned = assignedId;

  await FirebaseService.updateDocument("assignments", id, updateData);
  fetchTasks();
}
