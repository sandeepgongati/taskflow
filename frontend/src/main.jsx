import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { CalendarDays, CheckCircle2, KanbanSquare, Lock, LogOut, Plus, ShieldCheck, Users } from 'lucide-react';
import './styles.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

function App() {
  const [session, setSession] = useState(() => {
    const saved = localStorage.getItem('taskflow-session');
    return saved ? JSON.parse(saved) : null;
  });

  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const canManage = session && ['ADMIN', 'MANAGER'].includes(session.role);
  const canDelete = session?.role === 'ADMIN';

  useEffect(() => {
    if (!session) return;
    refresh();
  }, [session]);

  async function request(path, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || `Request failed: ${response.status}`);
    }

    if (response.status === 204) return null;
    return response.json();
  }

  async function refresh() {
    setLoading(true);
    setError('');
    try {
      const [taskData, userData] = await Promise.all([request('/api/tasks'), request('/api/users')]);
      setTasks(taskData);
      setUsers(userData);
    } catch (err) {
      setError(cleanError(err.message));
    } finally {
      setLoading(false);
    }
  }

  async function login(email, password) {
    setError('');
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Login failed. Check your email and password.');
    }

    const data = await response.json();
    localStorage.setItem('taskflow-session', JSON.stringify(data));
    setSession(data);
  }

  async function createTask(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      title: form.get('title'),
      description: form.get('description'),
      status: form.get('status'),
      priority: form.get('priority'),
      dueDate: form.get('dueDate') || null,
      assigneeId: form.get('assigneeId') ? Number(form.get('assigneeId')) : null,
    };

    await request('/api/tasks', { method: 'POST', body: JSON.stringify(payload) });
    event.currentTarget.reset();
    refresh();
  }

  async function updateStatus(task, status) {
    await request(`/api/tasks/${task.id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...task, status }),
    });
    refresh();
  }

  async function deleteTask(id) {
    await request(`/api/tasks/${id}`, { method: 'DELETE' });
    refresh();
  }

  function logout() {
    localStorage.removeItem('taskflow-session');
    setSession(null);
    setTasks([]);
    setUsers([]);
  }

  if (!session) {
    return <LoginScreen onLogin={login} />;
  }

  return (
    <main className="app">
      <header className="topbar">
        <div>
          <span className="brand"><KanbanSquare size={24} /> TaskFlow</span>
          <h1>Project command center</h1>
          <p>JWT-secured task planning with Spring Boot, React, PostgreSQL, Docker, and RBAC.</p>
        </div>
        <div className="profile">
          <ShieldCheck size={18} />
          <span>{session.name}</span>
          <strong>{session.role}</strong>
          <button className="iconButton" onClick={logout} aria-label="Log out" title="Log out">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {error && <div className="alert">{error}</div>}

      <section className="metrics">
        <Metric icon={<CheckCircle2 />} label="Completed" value={tasks.filter(t => t.status === 'DONE').length} />
        <Metric icon={<CalendarDays />} label="Active" value={tasks.filter(t => t.status !== 'DONE').length} />
        <Metric icon={<Users />} label="Members" value={users.length} />
      </section>

      {canManage && (
        <form className="taskForm" onSubmit={createTask}>
          <input name="title" placeholder="Task title" required />
          <input name="description" placeholder="Description" />
          <select name="status" defaultValue="TODO">
            <option value="TODO">To do</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="DONE">Done</option>
          </select>
          <select name="priority" defaultValue="MEDIUM">
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
          <input name="dueDate" type="date" />
          <select name="assigneeId" defaultValue="">
            <option value="">Unassigned</option>
            {users.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
          </select>
          <button type="submit"><Plus size={18} /> Add task</button>
        </form>
      )}

      <TaskBoard
        tasks={tasks}
        loading={loading}
        canManage={canManage}
        canDelete={canDelete}
        onStatusChange={updateStatus}
        onDelete={deleteTask}
      />
    </main>
  );
}

function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('admin@taskflow.dev');
  const [password, setPassword] = useState('Admin@123');
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setError('');
    try {
      await onLogin(email, password);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="login">
      <section className="loginPanel">
        <span className="brand"><KanbanSquare size={26} /> TaskFlow</span>
        <h1>Full-stack project management</h1>
        <p>Sign in with a seeded account to view RBAC-protected task APIs and the React dashboard.</p>
        <form onSubmit={submit}>
          <label>Email<input value={email} onChange={event => setEmail(event.target.value)} /></label>
          <label>Password<input type="password" value={password} onChange={event => setPassword(event.target.value)} /></label>
          {error && <div className="alert">{error}</div>}
          <button type="submit"><Lock size={18} /> Sign in</button>
        </form>
      </section>
      <aside className="demoAccounts">
        <h2>Demo accounts</h2>
        <button onClick={() => { setEmail('admin@taskflow.dev'); setPassword('Admin@123'); }}>Admin</button>
        <button onClick={() => { setEmail('manager@taskflow.dev'); setPassword('Manager@123'); }}>Manager</button>
        <button onClick={() => { setEmail('user@taskflow.dev'); setPassword('User@123'); }}>User</button>
      </aside>
    </main>
  );
}

function Metric({ icon, label, value }) {
  return (
    <article className="metric">
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function TaskBoard({ tasks, loading, canManage, canDelete, onStatusChange, onDelete }) {
  const columns = useMemo(() => [
    ['TODO', 'To do'],
    ['IN_PROGRESS', 'In progress'],
    ['DONE', 'Done'],
  ], []);

  return (
    <section className="board">
      {columns.map(([status, label]) => (
        <div className="column" key={status}>
          <h2>{label}</h2>
          {loading && <p className="muted">Loading tasks...</p>}
          {tasks.filter(task => task.status === status).map(task => (
            <article className="taskCard" key={task.id}>
              <div className="taskHeader">
                <strong>{task.title}</strong>
                <span className={`priority ${task.priority.toLowerCase()}`}>{task.priority}</span>
              </div>
              <p>{task.description || 'No description yet.'}</p>
              <dl>
                <div><dt>Assignee</dt><dd>{task.assigneeName}</dd></div>
                <div><dt>Due</dt><dd>{task.dueDate || 'Open'}</dd></div>
                <div><dt>Owner</dt><dd>{task.createdByName}</dd></div>
              </dl>
              {canManage && (
                <div className="actions">
                  {columns.filter(([next]) => next !== task.status).map(([next, nextLabel]) => (
                    <button key={next} onClick={() => onStatusChange(task, next)}>{nextLabel}</button>
                  ))}
                  {canDelete && <button className="danger" onClick={() => onDelete(task.id)}>Delete</button>}
                </div>
              )}
            </article>
          ))}
        </div>
      ))}
    </section>
  );
}

function cleanError(message) {
  return message.replace(/^\{"timestamp".+?"message":"?/, '').replace(/".*$/, '') || message;
}

createRoot(document.getElementById('root')).render(<App />);

