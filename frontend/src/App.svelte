<script>
  import { onMount } from 'svelte';

  const API = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api';

  let projects = [];
  let newProjectName = '';
  let selectedProject = null;
  let tasks = [];
  let newTaskTitle = '';

  const fetchProjects = async () => {
    const res = await fetch(`${API}/projects`);
    const json = await res.json();
    projects = json.data || [];
  };

  const createProject = async () => {
    if (!newProjectName) return;
    const res = await fetch(`${API}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newProjectName })
    });
    const j = await res.json();
    newProjectName = '';
    await fetchProjects();
    selectedProject = j.data;
    await fetchTasks();
  };

  const fetchTasks = async () => {
    if (!selectedProject) return;
    const res = await fetch(`${API}/projects/${selectedProject.id}/tasks`);
    const j = await res.json();
    tasks = j.data || [];
  };

  const addTask = async () => {
    if (!newTaskTitle || !selectedProject) return;
    const res = await fetch(`${API}/projects/${selectedProject.id}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTaskTitle })
    });
    newTaskTitle = '';
    await fetchTasks();
  };

  const toggleDone = async (task) => {
    const res = await fetch(`${API}/tasks/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done: !task.done })
    });
    await fetchTasks();
  };

  const deleteTask = async (task) => {
    await fetch(`${API}/tasks/${task.id}`, { method: 'DELETE' });
    await fetchTasks();
  };

  onMount(async () => {
    await fetchProjects();
  });
</script>

<style>
  /* minimal styles */
  body { font-family: system-ui, sans-serif; margin: 1rem; }
  .container { max-width: 900px; margin: 0 auto; }
  .projects { display:flex; gap: 8px; margin-bottom: 1rem; }
  .project { padding:8px 12px; border-radius:6px; background:#f3f4f6; cursor:pointer; }
  .project.selected { background:#c7f9cc; }
  .task { display:flex; justify-content:space-between; padding:6px; border-bottom:1px solid #eee; }
  .done { text-decoration: line-through; color: #888; }
</style>

<div class="container">
  <h1>Mini SaaS Starter (Lite)</h1>
  <p><i>codicem hominem sapere facit</i></p>

  <section>
    <h2>Projects</h2>
    <div class="projects">
      {#each projects as p}
        <div class="project {selectedProject && selectedProject.id === p.id ? 'selected' : ''}" on:click={() => { selectedProject = p; fetchTasks(); }}>
          <strong>{p.name}</strong>
        </div>
      {/each}
      <div>
        <input placeholder="New project name" bind:value={newProjectName} />
        <button on:click={createProject}>Create</button>
      </div>
    </div>
  </section>

  {#if selectedProject}
    <section>
      <h2>Tasks for {selectedProject.name}</h2>
      <div>
        <input placeholder="New task title" bind:value={newTaskTitle}/>
        <button on:click={addTask}>Add</button>
      </div>
      <div>
        {#each tasks as t}
          <div class="task">
            <div>
              <input type="checkbox" checked={t.done} on:change={() => toggleDone(t)} />
              <span class={t.done ? 'done' : ''}>{t.title}</span>
            </div>
            <div>
              <button on:click={() => deleteTask(t)}>Delete</button>
            </div>
          </div>
        {/each}
      </div>
    </section>
  {/if}
</div>
