import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowRight, BriefcaseBusiness, CalendarDays, CheckCircle2, KanbanSquare, Lock, LogOut, Plus, ShieldCheck, Sparkles, UserPlus, Users } from 'lucide-react';
import './styles.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

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
    if (DEMO_MODE) {
      return demoRequest(path, options, session);
    }

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
      const [taskData, userData] = await Promise.all([
        request('/api/tasks'),
        canManage ? request('/api/users') : Promise.resolve([]),
      ]);
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
    if (DEMO_MODE) {
      const data = demoLogin(email, password);
      localStorage.setItem('taskflow-session', JSON.stringify(data));
      setSession(data);
      return;
    }

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

  async function register(payload) {
    setError('');
    if (!payload.email.toLowerCase().endsWith('@taskflow.dev')) {
      throw new Error('Use your TaskFlow workspace email, for example name@taskflow.dev.');
    }

    if (DEMO_MODE) {
      const data = demoRegister(payload);
      localStorage.setItem('taskflow-session', JSON.stringify(data));
      setSession(data);
      return;
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(response.status === 409 ? 'This email is already registered.' : 'Registration failed. Use a valid @taskflow.dev email and try again.');
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
    return <LoginScreen onLogin={login} onRegister={register} />;
  }

  return (
    <main className="app">
      <header className="topbar">
        <div>
          <span className="brand"><KanbanSquare size={24} /> TaskFlow</span>
          <h1>Project command center</h1>
          <p>{DEMO_MODE ? 'Public portfolio demo running in the browser. Production mode connects to Spring Boot and PostgreSQL.' : 'JWT-secured task planning with Spring Boot, React, PostgreSQL, Docker, and RBAC.'}</p>
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
        <Metric icon={<Users />} label={canManage ? 'Registered users' : 'Visible team'} value={canManage ? users.length : tasks.length} />
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

      {canManage && <TeamDirectory users={users} />}
    </main>
  );
}

function LoginScreen({ onLogin, onRegister }) {
  const accounts = {
    admin: { label: 'Admin', detail: 'Developer', email: 'admin@taskflow.dev', password: 'Admin@123' },
    manager: { label: 'Manager', detail: 'Team Lead', email: 'manager@taskflow.dev', password: 'Manager@123' },
    user: { label: 'User', detail: 'Team Member', email: 'user@taskflow.dev', password: 'User@123' },
  };

  const [view, setView] = useState('home');
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('admin@taskflow.dev');
  const [password, setPassword] = useState('Admin@123');
  const [name, setName] = useState('');
  const [role, setRole] = useState('USER');
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setError('');
    try {
      if (mode === 'register') {
        await onRegister({ name, email, password, role });
      } else {
        await onLogin(email, password);
      }
    } catch (err) {
      setError(err.message);
    }
  }

  function chooseAccount(account) {
    setView('auth');
    setMode('login');
    setEmail(account.email);
    setPassword(account.password);
    setError('');
  }

  function openAuth(nextMode) {
    setMode(nextMode);
    if (nextMode === 'register') {
      setEmail('');
      setPassword('');
      setName('');
      setRole('USER');
    }
    setView('auth');
    setError('');
  }

  return (
    <main className={view === 'home' ? 'publicSite' : 'login'}>
      {view === 'home' ? (
        <HomePage onOpenAuth={openAuth} />
      ) : (
        <>
          <section className="loginHero">
            <span className="logoMark"><KanbanSquare size={30} /></span>
            <span className="brand">TaskFlow</span>
            <h1>Plan work, assign owners, and ship projects with clarity.</h1>
            <p>A secure project workspace for developers, team leads, and team members.</p>
            <div className="heroStats">
              <span><ShieldCheck size={17} /> JWT security</span>
              <span><BriefcaseBusiness size={17} /> Role-based access</span>
              <span><Sparkles size={17} /> Production-ready UI</span>
            </div>
          </section>

          <section className="loginPanel">
        <div className="authHeader">
          <span className="logoMark small"><KanbanSquare size={22} /></span>
          <div>
            <h2>{mode === 'login' ? 'Welcome back' : 'Create your workspace account'}</h2>
            <p>{mode === 'login' ? 'Use your role credentials to continue.' : 'Only Team Lead and Team Member accounts can self-register.'}</p>
          </div>
        </div>

        <div className="modeSwitch" aria-label="Authentication mode">
          <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')} type="button">Sign in</button>
          <button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')} type="button">Register</button>
        </div>

        <form onSubmit={submit}>
          {mode === 'register' && (
            <>
              <label>Full name<input value={name} onChange={event => setName(event.target.value)} required /></label>
              <label>Role
                <select value={role} onChange={event => setRole(event.target.value)}>
                  <option value="MANAGER">Manager - Team Lead</option>
                  <option value="USER">User - Team Member</option>
                </select>
              </label>
            </>
          )}
          <label>Email<input value={email} onChange={event => setEmail(event.target.value)} placeholder={mode === 'register' ? 'yourname@taskflow.dev' : 'admin@taskflow.dev'} required /></label>
          {mode === 'register' && <p className="fieldHint">Registration is limited to workspace emails ending in @taskflow.dev.</p>}
          <label>Password<input type="password" value={password} onChange={event => setPassword(event.target.value)} minLength={8} required /></label>
          {error && <div className="alert">{error}</div>}
          <button type="submit">{mode === 'login' ? <Lock size={18} /> : <UserPlus size={18} />} {mode === 'login' ? 'Sign in securely' : 'Create account'}</button>
        </form>

        <div className="quickRoles">
          <button type="button" onClick={() => chooseAccount(accounts.admin)}>
            <strong>Admin</strong><span>Developer</span>
          </button>
          <button type="button" onClick={() => chooseAccount(accounts.manager)}>
            <strong>Manager</strong><span>Team Lead</span>
          </button>
          <button type="button" onClick={() => chooseAccount(accounts.user)}>
            <strong>User</strong><span>Team Member</span>
          </button>
        </div>
      </section>
        </>
      )}
    </main>
  );
}

function HomePage({ onOpenAuth }) {
  return (
    <>
      <nav className="siteNav">
        <span className="brand"><KanbanSquare size={24} /> TaskFlow</span>
        <div>
          <button className="ghostButton" type="button" onClick={() => onOpenAuth('login')}>Sign in</button>
          <button type="button" onClick={() => onOpenAuth('register')}>Register <ArrowRight size={17} /></button>
        </div>
      </nav>

      <section className="homeHero">
        <div>
          <span className="eyebrow">Full-stack project management platform</span>
          <h1>Run projects with secure roles, clear ownership, and real-time task visibility.</h1>
          <p>TaskFlow brings teams into one focused workspace with JWT authentication, role-based permissions, task planning, and a production-minded React experience backed by Spring Boot APIs.</p>
          <div className="heroActions">
            <button type="button" onClick={() => onOpenAuth('register')}>Create account <UserPlus size={18} /></button>
            <button className="ghostButton" type="button" onClick={() => onOpenAuth('login')}>Sign in <Lock size={18} /></button>
          </div>
        </div>
        <div className="productPreview" aria-hidden="true">
          <div className="previewHeader">
            <span></span><span></span><span></span>
          </div>
          <div className="previewGrid">
            <article><strong>12</strong><span>Active tasks</span></article>
            <article><strong>04</strong><span>Team leads</span></article>
            <article><strong>98%</strong><span>Delivery focus</span></article>
          </div>
          <div className="previewTask high"></div>
          <div className="previewTask medium"></div>
          <div className="previewTask low"></div>
        </div>
      </section>

      <section className="featureBand">
        <article>
          <ShieldCheck size={26} />
          <h2>Secure by role</h2>
          <p>Admin, Manager, and User roles keep project actions controlled and predictable.</p>
        </article>
        <article>
          <BriefcaseBusiness size={26} />
          <h2>Built for delivery</h2>
          <p>Track task status, priority, due dates, ownership, and team accountability.</p>
        </article>
        <article>
          <Sparkles size={26} />
          <h2>Deployment ready</h2>
          <p>Designed with Docker, PostgreSQL, CI workflows, and public hosting in mind.</p>
        </article>
      </section>

      <footer className="siteFooter">
        <span>TaskFlow project management platform {DEMO_MODE ? '- public browser demo' : ''}</span>
        <strong>@Sandeep Gongati</strong>
      </footer>
    </>
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

function TeamDirectory({ users }) {
  return (
    <section className="teamDirectory">
      <div className="sectionHeader">
        <div>
          <span className="eyebrow">Admin visibility</span>
          <h2>Registered workspace users</h2>
        </div>
        <strong>{users.length} active accounts</strong>
      </div>
      <div className="userTable">
        <div className="userRow header">
          <span>Name</span>
          <span>Email</span>
          <span>Role</span>
          <span>Registered</span>
        </div>
        {users.map(user => (
          <div className="userRow" key={user.id}>
            <strong>{user.name}</strong>
            <span>{user.email}</span>
            <span className={`roleBadge ${user.role.toLowerCase()}`}>{roleLabel(user.role)}</span>
            <span>{formatDate(user.createdAt)}</span>
          </div>
        ))}
      </div>
    </section>
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

function roleLabel(role) {
  if (role === 'ADMIN') return 'Admin - Developer';
  if (role === 'MANAGER') return 'Manager - Team Lead';
  return 'User - Team Member';
}

function formatDate(value) {
  if (!value) return 'Today';
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}

function demoLogin(email, password) {
  const store = demoStore();
  const user = store.users.find(item => item.email.toLowerCase() === email.toLowerCase() && item.password === password);
  if (!user) {
    throw new Error('Login failed. Check your email and password.');
  }
  return demoSession(user);
}

function demoRegister(payload) {
  const store = demoStore();
  const email = payload.email.toLowerCase();
  if (!email.endsWith('@taskflow.dev')) {
    throw new Error('Use your TaskFlow workspace email, for example name@taskflow.dev.');
  }
  if (store.users.some(user => user.email === email)) {
    throw new Error('This email is already registered.');
  }

  const user = {
    id: Date.now(),
    name: payload.name,
    email,
    password: payload.password,
    role: payload.role === 'MANAGER' ? 'MANAGER' : 'USER',
    createdAt: new Date().toISOString(),
  };
  store.users.push(user);
  saveDemoStore(store);
  return demoSession(user);
}

function demoRequest(path, options = {}, session) {
  const store = demoStore();
  const method = options.method || 'GET';

  if (path === '/api/tasks' && method === 'GET') {
    return Promise.resolve(store.tasks);
  }
  if (path === '/api/users' && method === 'GET') {
    return Promise.resolve(store.users.map(({ password, ...user }) => user));
  }
  if (path === '/api/tasks' && method === 'POST') {
    const payload = JSON.parse(options.body);
    const assignee = store.users.find(user => user.id === payload.assigneeId);
    const task = {
      id: Date.now(),
      ...payload,
      assigneeName: assignee?.name || 'Unassigned',
      createdByName: session?.name || 'Demo User',
      createdAt: new Date().toISOString(),
    };
    store.tasks.unshift(task);
    saveDemoStore(store);
    return Promise.resolve(task);
  }
  if (path.startsWith('/api/tasks/') && method === 'PUT') {
    const id = Number(path.split('/').pop());
    const payload = JSON.parse(options.body);
    const assignee = store.users.find(user => user.id === payload.assigneeId);
    store.tasks = store.tasks.map(task => task.id === id ? { ...task, ...payload, assigneeName: assignee?.name || 'Unassigned' } : task);
    saveDemoStore(store);
    return Promise.resolve(store.tasks.find(task => task.id === id));
  }
  if (path.startsWith('/api/tasks/') && method === 'DELETE') {
    const id = Number(path.split('/').pop());
    store.tasks = store.tasks.filter(task => task.id !== id);
    saveDemoStore(store);
    return Promise.resolve(null);
  }

  return Promise.reject(new Error('Demo endpoint not available.'));
}

function demoSession(user) {
  return {
    token: `demo-token-${user.id}`,
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

function demoStore() {
  const saved = localStorage.getItem('taskflow-demo-store');
  if (saved) {
    return JSON.parse(saved);
  }
  const now = new Date().toISOString();
  const seeded = {
    users: [
      { id: 1, name: 'Sandeep Gongati', email: 'admin@taskflow.dev', password: 'Admin@123', role: 'ADMIN', createdAt: now },
      { id: 2, name: 'Project Manager', email: 'manager@taskflow.dev', password: 'Manager@123', role: 'MANAGER', createdAt: now },
      { id: 3, name: 'Team Member', email: 'user@taskflow.dev', password: 'User@123', role: 'USER', createdAt: now },
    ],
    tasks: [
      { id: 101, title: 'Prepare public demo', description: 'Polish the portfolio homepage and auth flow.', status: 'IN_PROGRESS', priority: 'HIGH', dueDate: nextDate(3), assigneeId: 2, assigneeName: 'Project Manager', createdByName: 'Sandeep Gongati', createdAt: now },
      { id: 102, title: 'Connect production database', description: 'Use PostgreSQL for deployed persistence.', status: 'TODO', priority: 'MEDIUM', dueDate: nextDate(7), assigneeId: 3, assigneeName: 'Team Member', createdByName: 'Sandeep Gongati', createdAt: now },
      { id: 103, title: 'Verify GitHub deployment', description: 'Publish the static demo and test the public URL.', status: 'DONE', priority: 'HIGH', dueDate: nextDate(1), assigneeId: 1, assigneeName: 'Sandeep Gongati', createdByName: 'Sandeep Gongati', createdAt: now },
    ],
  };
  saveDemoStore(seeded);
  return seeded;
}

function saveDemoStore(store) {
  localStorage.setItem('taskflow-demo-store', JSON.stringify(store));
}

function nextDate(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

createRoot(document.getElementById('root')).render(<App />);
