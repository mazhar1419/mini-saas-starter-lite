<script>
  import { onMount } from 'svelte';
  import { fly, fade } from 'svelte/transition';

  const API = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api';

  let projects = [];
  let newProjectName = '';
  let selectedProject = null;
  let tasks = [];
  let newTaskTitle = '';
  let loading = false;
  let errorMsg = '';

  const handleErr = async (res) => {
    try {
      const j = await res.json();
      return j.error || JSON.stringify(j);
    } catch {
      return res.statusText || 'Unknown error';
    }
  };

  const fetchProjects = async () => {
    loading = true;
    errorMsg = '';
    try {
      const res = await fetch(`${API}/projects`);
      if (!res.ok) throw new Error(await handleErr(res));
      const json = await res.json();
      projects = json.data || [];
    } catch (e) {
      errorMsg = e.message;
    } finally {
      loading = false;
    }
  };

  const createProject = async () => {
    if (!newProjectName.trim()) return;
    loading = true;
    errorMsg = '';
    try {
      const res = await fetch(`${API}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newProjectName.trim() })
      });
      if (!res.ok) throw new Error(await handleErr(res));
      const j = await res.json();
      newProjectName = '';
      await fetchProjects();
      selectedProject = j.data;
      await fetchTasks();
    } catch (e) {
      errorMsg = e.message;
    } finally {
      loading = false;
    }
  };

  const fetchTasks = async () => {
    if (!selectedProject) {
      tasks = [];
      return;
    }
    loading = true;
    errorMsg = '';
    try {
      const res = await fetch(`${API}/projects/${selectedProject.id}/tasks`);
      if (!res.ok) throw new Error(await handleErr(res));
      const j = await res.json();
      tasks = j.data || [];
    } catch (e) {
      errorMsg = e.message;
    } finally {
      loading = false;
    }
  };

  const addTask = async () => {
    if (!newTaskTitle.trim() || !selectedProject) return;
    loading = true;
    errorMsg = '';
    try {
      const res = await fetch(`${API}/projects/${selectedProject.id}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTaskTitle.trim() })
      });
      if (!res.ok) throw new Error(await handleErr(res));
      newTaskTitle = '';
      await fetchTasks();
    } catch (e) {
      errorMsg = e.message;
    } finally {
      loading = false;
    }
  };

  const toggleDone = async (task) => {
    try {
      const res = await fetch(`${API}/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ done: !task.done })
      });
      if (!res.ok) throw new Error(await handleErr(res));
      await fetchTasks();
    } catch (e) {
      errorMsg = e.message;
    }
  };

  const deleteTask = async (task) => {
    if (!confirm('Delete this task?')) return;
    try {
      const res = await fetch(`${API}/tasks/${task.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(await handleErr(res));
      await fetchTasks();
    } catch (e) {
      errorMsg = e.message;
    }
  };

  const selectProject = async (p) => {
    selectedProject = p;
    await fetchTasks();
  };

  onMount(async () => {
    await fetchProjects();
  });
</script>

<style>
  :global(body) { margin:0; font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; background: linear-gradient(180deg,#f8fafc 0%, #ffffff 100%); color: #0f172a; }

  :root{
    --accent:#0b6cff;
    --muted:#94a3b8;
    --card:#ffffff;
    --glass: rgba(255,255,255,0.6);
    --radius:12px;
    --shadow: 0 8px 24px rgba(12,15,20,0.06);
  }

  .app {
    max-width: 1100px;
    margin: 28px auto;
    padding: 20px;
  }

  .header {
    display:flex;
    justify-content:space-between;
    align-items:center;
    gap:16px;
    margin-bottom:18px;
  }
  .brand {
    display:flex;
    gap:12px;
    align-items:center;
  }
  .logo {
    width:44px; height:44px; border-radius:10px;
    display:flex; align-items:center; justify-content:center;
    background: linear-gradient(135deg,var(--accent), #4ba3ff); color:white; font-weight:700; box-shadow: 0 6px 18px rgba(11,108,255,0.14);
  }
  .title { font-size:1.15rem; font-weight:600; }
  .subtitle { color:var(--muted); font-size:0.85rem; }

  .layout {
    display:grid;
    grid-template-columns: 280px 1fr;
    gap:18px;
  }

  /* SIDEBAR */
  .sidebar {
    background:var(--card);
    border-radius:var(--radius);
    box-shadow:var(--shadow);
    padding:14px;
    height: calc(100vh - 160px);
    overflow:auto;
  }

  .search {
    display:flex;
    gap:8px;
    margin-bottom:12px;
  }
  .search input {
    flex:1;
    padding:10px 12px;
    border-radius:10px;
    border:1px solid #eef2ff;
    outline:none;
    font-size:0.95rem;
  }
  .new-project {
    display:flex;
    gap:8px;
    margin-bottom:12px;
  }
  .btn {
    background:var(--accent);
    color:white;
    border:0;
    padding:8px 10px;
    border-radius:8px;
    cursor:pointer;
    font-weight:600;
  }
  .btn.secondary {
    background:transparent; color:var(--accent); border:1px solid rgba(11,108,255,0.12);
    font-weight:600;
  }

  .projects-list { display:flex; flex-direction:column; gap:8px; }
  .project-item {
    display:flex; align-items:center; justify-content:space-between; gap:8px;
    padding:10px; border-radius:10px; cursor:pointer;
    transition: transform .12s ease, box-shadow .12s ease;
  }
  .project-item:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(12,15,20,0.06); }
  .project-item.active { background: linear-gradient(90deg, #e8f1ff, #f6fbff); border:1px solid rgba(11,108,255,0.12); }

  .project-name { font-weight:600; }
  .project-meta { color:var(--muted); font-size:0.85rem; }

  /* MAIN */
  .main {
    background: linear-gradient(180deg, rgba(255,255,255,0.8), rgba(255,255,255,0.9));
    border-radius:var(--radius);
    box-shadow:var(--shadow);
    padding:18px;
    min-height: 60vh;
  }

  .main-header { display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:12px; }
  .project-title { font-size:1.05rem; font-weight:700; }
  .muted { color:var(--muted); font-size:0.9rem; }

  .task-input { display:flex; gap:8px; margin-bottom:12px; }
  .task-input input { flex:1; padding:10px 12px; border-radius:10px; border:1px solid #eef2ff; }
  .task-list { display:flex; flex-direction:column; gap:8px; }

  .task {
    display:flex; justify-content:space-between; align-items:center; padding:12px; border-radius:10px;
    background:#fff; border:1px solid #f1f5f9;
  }
  .task-left { display:flex; gap:12px; align-items:center; }
  .checkbox {
    width:18px; height:18px; border-radius:6px; border:1px solid #e6edf8; display:flex; align-items:center; justify-content:center; cursor:pointer; background:white;
  }
  .checkbox.checked { background: linear-gradient(90deg,var(--accent), #4ba3ff); color:white; border: none; }

  .task-title { font-weight:600; }
  .task-title.done { text-decoration:line-through; color:var(--muted); font-weight:500; }

  .task-actions button { background:transparent; border:0; cursor:pointer; color:var(--muted); padding:6px; border-radius:8px; }
  .task-actions button:hover { background: #f8fafc; color:var(--accent); }

  .empty { text-align:center; color:var(--muted); padding:36px 12px; border:1px dashed #eef2ff; border-radius:8px; }

  /* responsive */
  @media (max-width:900px) {
    .layout { grid-template-columns: 1fr; }
    .sidebar { height:auto; order:2; }
    .main { order:1; }
  }
</style>

<div class="app">
  <div class="header">
    <div class="brand">
      <div class="logo">MI</div>
      <div>
        <div class="title">Mazharul — Programmer / Coder</div>
        <div class="subtitle">codicem hominem sapere facit — code makes a person wise</div>
      </div>
    </div>

    <div class="subtitle">Backend: <strong>{API.replace('/api','')}</strong></div>
  </div>

  <div class="layout">
    <!-- SIDEBAR -->
    <aside class="sidebar" in:fly="{{ x: -20, duration: 250 }}">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <strong>Projects</strong>
        <button class="btn secondary" on:click={fetchProjects} aria-label="Refresh projects">
          <!-- refresh icon -->
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M21 12a9 9 0 10-9 9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 3v6h-6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>

      <div class="search" style="margin-bottom:10px;">
        <input placeholder="Filter projects (type to search)" on:input={(e)=>{ const q = e.target.value.toLowerCase(); if(!q) return fetchProjects(); projects = projects.filter(p => p.name.toLowerCase().includes(q)); }} />
      </div>

      <div class="new-project">
        <input placeholder="New project name" bind:value={newProjectName} on:keydown={(e)=> e.key==='Enter' && createProject()} />
        <button class="btn" on:click={createProject}>Create</button>
      </div>

      <div class="projects-list" aria-live="polite">
        {#if loading}
          <div class="muted">Loading projects…</div>
        {:else if projects.length === 0}
          <div class="empty">No projects yet. Create one to get started.</div>
        {:else}
          {#each projects as p (p.id)}
            <div class="project-item {selectedProject && selectedProject.id === p.id ? 'active' : ''}" on:click={() => selectProject(p)} title="Open project">
              <div>
                <div class="project-name">{p.name}</div>
                <div class="project-meta">ID: {p.id} • {new Date(p.created_at).toLocaleString()}</div>
              </div>
              <div style="display:flex; gap:8px; align-items:center;">
                <button class="project-actions" on:click|stopPropagation={() => { selectedProject = p; fetchTasks(); }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 20v-6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M20 12h-6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
                </button>
              </div>
            </div>
          {/each}
        {/if}
      </div>
    </aside>

    <!-- MAIN -->
    <main class="main" in:fade>
      <div class="main-header">
        <div>
          {#if selectedProject}
            <div class="project-title">{selectedProject.name}</div>
            <div class="muted">Project ID: {selectedProject.id} • {new Date(selectedProject.created_at).toLocaleString()}</div>
          {:else}
            <div class="project-title">Select a project</div>
            <div class="muted">Pick or create a project to manage tasks</div>
          {/if}
        </div>

        <div>
          <button class="btn secondary" on:click={() => { selectedProject = null; tasks = []; }}>Close</button>
        </div>
      </div>

      {#if errorMsg}
        <div class="error" style="color:#b91c1c; margin-bottom:12px;">{errorMsg}</div>
      {/if}

      {#if !selectedProject}
        <div class="empty">No project selected — choose one on the left or create a new project.</div>
      {:else}
        <div class="task-input">
          <input placeholder="New task title" bind:value={newTaskTitle} on:keydown={(e)=> e.key==='Enter' && addTask()} />
          <button class="btn" on:click={addTask}>Add task</button>
        </div>

        {#if loading}
          <div class="muted">Loading tasks…</div>
        {/if}

        {#if tasks.length === 0 && !loading}
          <div class="empty">No tasks yet — add a task to get started.</div>
        {/if}

        <div class="task-list" aria-live="polite">
          {#each tasks as t (t.id)}
            <div class="task" transition:fly="{{ y:6, duration:150 }}">
              <div class="task-left">
                <div class="checkbox {t.done ? 'checked' : ''}" role="button" aria-pressed={t.done} on:click={() => toggleDone(t)}>
                  {#if t.done}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  {/if}
                </div>
                <div class="task-title {t.done ? 'done' : ''}">{t.title}</div>
              </div>
              <div class="task-actions">
                <button title="Delete task" on:click={() => deleteTask(t)} aria-label="Delete">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 6h18" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 11v6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M14 11v6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
                </button>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </main>
  </div>
</div>
