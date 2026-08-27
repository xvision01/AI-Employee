import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Dashboard.css";

type Task = { id: number; title: string; project: string; priority: "High" | "Medium" | "Low"; status: "Queued" | "In progress" | "Done" };
type Activity = { id: number; text: string; time: string; kind: "success" | "work" | "review" };

const initialTasks: Task[] = [
    { id: 1, title: "Review Q3 sales report", project: "Finance", priority: "High", status: "In progress" },
    { id: 2, title: "Prepare weekly team summary", project: "Operations", priority: "Medium", status: "Queued" },
    { id: 3, title: "Organize project documentation", project: "Product", priority: "Low", status: "Queued" },
    { id: 4, title: "Draft client follow-up email", project: "Sales", priority: "High", status: "Done" },
];

const initialActivity: Activity[] = [
    { id: 1, text: "Finished drafting client follow-up", time: "8 min ago", kind: "success" },
    { id: 2, text: "Analyzed Q3 sales spreadsheet", time: "21 min ago", kind: "work" },
    { id: 3, text: "Waiting for approval: vendor email", time: "34 min ago", kind: "review" },
];

function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [tasks, setTasks] = useState(initialTasks);
    const [activity, setActivity] = useState(initialActivity);
    const [command, setCommand] = useState("");
    const [notice, setNotice] = useState("Your AI employee is online and ready.");

    const completed = tasks.filter((task) => task.status === "Done").length;
    const active = tasks.filter((task) => task.status !== "Done").length;
    const progress = Math.round((completed / tasks.length) * 100);

    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
    }, []);

    function runCommand() {
        const value = command.trim();
        if (!value) return;
        const task: Task = { id: Date.now(), title: value, project: "AI request", priority: "Medium", status: "In progress" };
        setTasks((current) => [task, ...current]);
        setActivity((current) => [{ id: Date.now(), text: `Started: ${value}`, time: "just now", kind: "work" }, ...current]);
        setNotice(`I created a task for “${value}” and started working on it.`);
        setCommand("");
    }

    function cycleTask(id: number) {
        setTasks((current) => current.map((task) => {
            if (task.id !== id) return task;
            const next = task.status === "Queued" ? "In progress" : task.status === "In progress" ? "Done" : "Queued";
            return { ...task, status: next };
        }));
        setNotice("Task status updated.");
    }

    function handleLogout() {
        logout();
        navigate("/login");
    }

    return (
        <div className="employee-app">
            <aside className="sidebar">
                <div className="brand"><span className="brand-mark">✦</span><span>AI Employee</span></div>
                <div className="online"><span /> Online</div>
                <nav>
                    <button className="nav-item active"><span>⌂</span> Overview</button>
                    <button className="nav-item"><span>✓</span> Tasks <b>{active}</b></button>
                    <button className="nav-item"><span>◷</span> Activity</button>
                    <button className="nav-item"><span>⚡</span> Automations</button>
                    <button className="nav-item"><span>◈</span> Integrations</button>
                </nav>
                <div className="sidebar-bottom">
                    <div className="agent-card"><div className="agent-avatar">AI</div><div><strong>Employee mode</strong><small>Autonomous · supervised</small></div></div>
                    <button className="logout" onClick={handleLogout}>↪ Sign out</button>
                </div>
            </aside>

            <main className="main-content">
                <header className="topbar">
                    <div><p className="eyebrow">WORKSPACE / TODAY</p><h1>{greeting}, {user?.name?.split(" ")[0] || "there"}.</h1></div>
                    <div className="user-chip"><div className="avatar">{(user?.name || "U").slice(0, 1).toUpperCase()}</div><div><strong>{user?.name || "Workspace owner"}</strong><small>Workspace owner</small></div></div>
                </header>

                <section className="hero-card">
                    <div className="hero-copy"><div className="status-pill"><span /> AI EMPLOYEE ACTIVE</div><h2>Tell me what needs to get done.</h2><p>Delegate research, writing, organization, analysis, and routine follow-ups. I’ll turn your request into work.</p></div>
                    <div className="hero-orb"><span>✦</span></div>
                    <div className="command-box"><input value={command} onChange={(e) => setCommand(e.target.value)} onKeyDown={(e) => e.key === "Enter" && runCommand()} placeholder="e.g. Summarize my open tasks and prioritize them"/><button onClick={runCommand}>Run task <span>→</span></button></div>
                </section>

                <p className="notice"><span>✦</span>{notice}</p>

                <section className="stats-grid">
                    <div className="stat-card"><span className="stat-icon">✓</span><div><small>Completed today</small><strong>{completed}</strong></div><em>+2 today</em></div>
                    <div className="stat-card"><span className="stat-icon">◷</span><div><small>Active tasks</small><strong>{active}</strong></div><em>working now</em></div>
                    <div className="stat-card"><span className="stat-icon">◎</span><div><small>Daily progress</small><strong>{progress}%</strong></div><em>on track</em></div>
                </section>

                <div className="content-grid">
                    <section className="panel"><div className="panel-head"><div><p className="eyebrow">WORK QUEUE</p><h3>Tasks</h3></div><button className="ghost" onClick={() => setCommand("Create a new task")}>+ Add task</button></div>
                        <div className="task-list">{tasks.map((task) => <div className="task-row" key={task.id}><button className={`check ${task.status === "Done" ? "checked" : ""}`} onClick={() => cycleTask(task.id)}>{task.status === "Done" ? "✓" : ""}</button><div className="task-info"><strong className={task.status === "Done" ? "strike" : ""}>{task.title}</strong><small>{task.project}</small></div><span className={`priority ${task.priority.toLowerCase()}`}>{task.priority}</span><span className={`task-status ${task.status.toLowerCase().replace(" ", "-")}`}>{task.status}</span></div>)}</div>
                    </section>

                    <section className="panel activity-panel"><div className="panel-head"><div><p className="eyebrow">LIVE FEED</p><h3>Agent activity</h3></div><span className="live-dot">LIVE</span></div><div className="activity-list">{activity.map((item) => <div className="activity-row" key={item.id}><span className={`activity-icon ${item.kind}`}>{item.kind === "success" ? "✓" : item.kind === "review" ? "!" : "✦"}</span><div><strong>{item.text}</strong><small>{item.time}</small></div></div>)}</div><button className="activity-link" onClick={() => setNotice("Activity history is ready for review.")}>View all activity →</button></section>
                </div>

                <section className="approval"><div className="approval-icon">!</div><div><p className="eyebrow">NEEDS YOUR INPUT</p><h3>1 action is waiting for approval</h3><p>The agent prepared a vendor follow-up email. Review it before it is sent.</p></div><button onClick={() => setNotice("Approval opened. In a production build this would show the prepared email.")}>Review action →</button></section>
            </main>
        </div>
    );
}

export default Dashboard;
