import React, { useState, useEffect, useRef } from 'react';
import { 
  PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, Cell 
} from 'recharts';
import './App.css';

// --- Utility: Format Time (00:00:00) ---
const formatTime = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

function App() {
  // --- 1. STATE MANAGEMENT ---
  
  // User & Identity
  const [userInfo, setUserInfo] = useState(() => JSON.parse(localStorage.getItem('studyUser')) || null);
  
  // Goals & Settings
  const [studyGoal, setStudyGoal] = useState(() => JSON.parse(localStorage.getItem('studyGoal')) || { target: 120, period: 'daily' });
  const [settings, setSettings] = useState(() => JSON.parse(localStorage.getItem('studySettings')) || { pomoTime: 25, shortBreak: 5 });

  // Timer Logic
  const [mode, setMode] = useState('stopwatch'); // 'stopwatch' or 'pomodoro'
  const [studyStatus, setStudyStatus] = useState('idle'); // idle, running, paused, finished
  const [timer, setTimer] = useState(0); 
  const [startTime, setStartTime] = useState(null);
  
  // NEW: Break Logic
  const [breakTimer, setBreakTimer] = useState(0); // Tracks current break duration
  const [totalBreakTime, setTotalBreakTime] = useState(0); // Tracks cumulative breaks in this session
  const [currentPauseReason, setCurrentPauseReason] = useState(''); // Stores the reason for display

  // Data Storage
  const [sessions, setSessions] = useState(() => JSON.parse(localStorage.getItem('studySessions')) || []);
  const [timetable, setTimetable] = useState(() => JSON.parse(localStorage.getItem('studyTimetable')) || []);
  const [scratchpad, setScratchpad] = useState(() => localStorage.getItem('studyScratchpad') || '');

  // UI State
  const [modal, setModal] = useState({ open: false, type: '', data: null });
  const [activeTab, setActiveTab] = useState('dashboard');
  const audioRef = useRef(new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg'));

  // --- 2. PERSISTENCE EFFECTS ---
  useEffect(() => { localStorage.setItem('studyUser', JSON.stringify(userInfo)); }, [userInfo]);
  useEffect(() => { localStorage.setItem('studyGoal', JSON.stringify(studyGoal)); }, [studyGoal]);
  useEffect(() => { localStorage.setItem('studySettings', JSON.stringify(settings)); }, [settings]);
  useEffect(() => { localStorage.setItem('studySessions', JSON.stringify(sessions)); }, [sessions]);
  useEffect(() => { localStorage.setItem('studyTimetable', JSON.stringify(timetable)); }, [timetable]);
  useEffect(() => { localStorage.setItem('studyScratchpad', scratchpad); }, [scratchpad]);

  // --- 3. TIMER EFFECTS ---
  
  // Handle Timer Ticking (Study AND Break)
  useEffect(() => {
    let interval = null;
    
    // CASE A: Study Timer is running
    if (studyStatus === 'running') {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (mode === 'pomodoro') {
            if (prev <= 1) {
              clearInterval(interval);
              handleSessionComplete(); // Auto finish at 0
              return 0;
            }
            return prev - 1;
          }
          return prev + 1; // Stopwatch counts up
        });
      }, 1000);
    } 
    // CASE B: Break Timer is running
    else if (studyStatus === 'paused') {
      interval = setInterval(() => {
        setBreakTimer((prev) => prev + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [studyStatus, mode]);

  // Update Tab Title with Timer
  useEffect(() => {
    if (studyStatus === 'running') {
      document.title = `(${formatTime(timer)}) StudySync`;
    } else if (studyStatus === 'paused') {
      document.title = `☕ (${formatTime(breakTimer)}) On Break`;
    } else {
      document.title = 'StudySync - Dashboard';
    }
  }, [timer, breakTimer, studyStatus]);

  // Sync Settings to Timer (only when idle)
  useEffect(() => {
    if (studyStatus === 'idle' && mode === 'pomodoro') {
      setTimer(settings.pomoTime * 60);
    }
  }, [settings, studyStatus, mode]);

  // --- 4. HANDLERS ---

  const startSession = () => {
    setStudyStatus('running');
    if (!startTime) setStartTime(new Date());
    setTotalBreakTime(0); // Reset session break tracker
    setBreakTimer(0);
    // If switching to pomodoro from idle, ensure correct time
    if (mode === 'pomodoro' && studyStatus === 'idle' && timer === 0) {
        setTimer(settings.pomoTime * 60);
    }
  };

  const pauseSession = () => {
    setStudyStatus('paused');
    setBreakTimer(0); // Start break timer from 0
    setModal({ open: true, type: 'pause_reason' });
  };

  const confirmPause = (reason) => {
    setCurrentPauseReason(reason || 'Taking a break');
    setModal({ open: false, type: '' });
  };

  const resumeSession = () => {
    setStudyStatus('running');
    // Add the break that just finished to the total
    setTotalBreakTime(prev => prev + breakTimer);
    setBreakTimer(0);
    setCurrentPauseReason('');
  };

  const stopSession = () => {
    setStudyStatus('finished');
    setModal({ open: true, type: 'session_summary' });
  };

  const handleSessionComplete = () => {
    try { audioRef.current.play(); } catch(e) { console.error("Audio error", e); }
    setStudyStatus('finished');
    setModal({ open: true, type: 'session_summary' });
  };

  const saveSession = (topic) => {
    const endTime = new Date();
    
    // Add any ongoing break time if they finished while paused
    const finalBreakTime = totalBreakTime + (studyStatus === 'paused' ? breakTimer : 0);

    // Calculate Study Duration
    let studyDuration = 0;
    if (mode === 'stopwatch') studyDuration = timer;
    else studyDuration = (settings.pomoTime * 60) - timer; // Original time - remaining

    // Prevent saving 0 second sessions or negatives
    if(studyDuration < 0) studyDuration = settings.pomoTime * 60; 

    // Calculate Break Percentage
    // Formula: (Total Break / (Study Time + Total Break)) * 100
    const totalSessionTime = studyDuration + finalBreakTime;
    const breakPercentage = totalSessionTime > 0 ? Math.round((finalBreakTime / totalSessionTime) * 100) : 0;

    const newSession = {
      id: Date.now(),
      start: startTime || new Date(),
      end: endTime,
      duration: studyDuration, 
      breakDuration: finalBreakTime,
      breakPercentage: breakPercentage,
      topic: topic || 'General Study',
      mode: mode,
      pauseReason: currentPauseReason || 'No specific reason'
    };

    setSessions([...sessions, newSession]);
    
    // Reset Logic
    setStudyStatus('idle');
    setStartTime(null);
    setBreakTimer(0);
    setTotalBreakTime(0);
    setCurrentPauseReason('');
    setModal({ open: false, type: '' });
    
    if(mode === 'pomodoro') setTimer(settings.pomoTime * 60);
    else setTimer(0);
  };

  // Timetable Handlers
  const addTask = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newTask = {
      id: Date.now(),
      time: formData.get('time'),
      task: formData.get('task'),
      priority: formData.get('priority'),
      completed: false
    };
    setTimetable([...timetable, newTask]);
    e.target.reset();
  };

  const toggleTask = (id) => {
    setTimetable(timetable.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id) => {
    setTimetable(timetable.filter(t => t.id !== id));
  };

  // --- 5. ANALYTICS ---
  const today = new Date().toDateString();
  const todaysSessions = sessions.filter(s => new Date(s.start).toDateString() === today);
  const totalSecondsToday = todaysSessions.reduce((acc, s) => acc + s.duration, 0);
  const goalProgress = Math.min(100, Math.round((totalSecondsToday / 60 / studyGoal.target) * 100));
  
  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Charts Data
  const subjectData = Object.entries(sessions.reduce((acc, s) => {
    acc[s.topic] = (acc[s.topic] || 0) + s.duration;
    return acc;
  }, {})).map(([name, val]) => ({ name, value: Math.round(val / 60) }));

  const getWeeklyData = () => {
    const data = [];
    for(let i=6; i>=0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toDateString();
      const daySecs = sessions
        .filter(s => new Date(s.start).toDateString() === dateStr)
        .reduce((acc, s) => acc + s.duration, 0);
      data.push({ name: d.toLocaleDateString('en-US', { weekday: 'short' }), minutes: Math.round(daySecs / 60) });
    }
    return data;
  };

  // --- 6. RENDER ---
  if (!userInfo) {
    return (
      <div className="app-container welcome-screen">
        <div className="glass-panel welcome-box">
          <h1>🎓 Smart Study<span className="accent">Manager</span></h1>
          <p>Create your profile to begin your productivity journey.</p>
          <form onSubmit={(e) => {
            e.preventDefault();
            setUserInfo({ name: e.target.name.value });
          }}>
            <input type="text" name="name" placeholder="Enter your name" required />
            <button type="submit" className="btn-primary">Start Journey</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* SIDEBAR */}
      <nav className="sidebar">
        <div className="logo">Study<span className="accent">Sync</span></div>
        <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>⏱ Dashboard</button>
        <button className={activeTab === 'timetable' ? 'active' : ''} onClick={() => setActiveTab('timetable')}>📅 Timetable</button>
        <button className={activeTab === 'analytics' ? 'active' : ''} onClick={() => setActiveTab('analytics')}>📊 Analytics</button>
        <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>⚙️ Settings</button>
        
        <div className="user-mini-profile">
          <div className="avatar">{userInfo.name.charAt(0)}</div>
          <span>{userInfo.name}</span>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="main-content">
        
        {/* --- DASHBOARD --- */}
        {activeTab === 'dashboard' && (
          <div className="dashboard-grid">
            {/* Header */}
            <div className="dashboard-header">
               <h2>{getGreeting()}, <span style={{color: 'var(--accent-primary)'}}>{userInfo.name}</span>.</h2>
               <p style={{color: 'var(--text-muted)'}}>Time to get productive.</p>
            </div>

            {/* Timer Card (Left) */}
            <div className="glass-panel timer-card">
              <div className="timer-header">
                <h3>{mode === 'pomodoro' ? '🍅 Pomodoro' : '⏱ Stopwatch'}</h3>
                <div className="mode-toggle">
                  <button className={mode === 'stopwatch' ? 'active' : ''} onClick={() => { setMode('stopwatch'); setTimer(0); setStudyStatus('idle'); }}>Count Up</button>
                  <button className={mode === 'pomodoro' ? 'active' : ''} onClick={() => { setMode('pomodoro'); setTimer(settings.pomoTime * 60); setStudyStatus('idle'); }}>Countdown</button>
                </div>
              </div>
              
              {/* Conditional Display: Study Timer vs Break Timer */}
              {studyStatus === 'paused' ? (
                 <div style={{textAlign: 'center', animation: 'fadeIn 0.5s'}}>
                    <h3 style={{color: 'var(--warning)', fontSize: '1.2rem', margin: '0'}}>⏸️ On Break: {currentPauseReason}</h3>
                    <div className="timer-display" style={{ background: 'linear-gradient(180deg, #ffb84d 0%, #7c2d12 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
                        {formatTime(breakTimer)}
                    </div>
                    <small style={{color: 'var(--text-muted)'}}>Total break time: {formatTime(totalBreakTime + breakTimer)}</small>
                 </div>
              ) : (
                <div className="timer-display">{formatTime(timer)}</div>
              )}

              <div className="timer-controls">
                {studyStatus === 'idle' && <button className="btn-primary" onClick={startSession}>Start Session</button>}
                {studyStatus === 'running' && <button className="btn-warning" onClick={pauseSession}>Pause</button>}
                {studyStatus === 'paused' && <button className="btn-primary" onClick={resumeSession}>Resume</button>}
                {(studyStatus === 'running' || studyStatus === 'paused') && <button className="btn-danger" onClick={stopSession}>Finish</button>}
              </div>
            </div>

            {/* Stats Card (Right Top) */}
            <div className="glass-panel stats-card">
              <h3>Daily Progress</h3>
              <div className="progress-circle-container">
                 <div className="stat-item">
                    <span className="stat-val">{Math.round(totalSecondsToday / 60)}m</span>
                    <span className="stat-label">Focus</span>
                 </div>
                 <div className="stat-divider"></div>
                 <div className="stat-item">
                    <span className="stat-val">{goalProgress}%</span>
                    <span className="stat-label">Goal</span>
                 </div>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: `${goalProgress}%` }}></div>
              </div>
            </div>

            {/* Scratchpad (Right Bottom) */}
            <div className="glass-panel scratchpad-card">
              <h3>Brain Dump</h3>
              <textarea 
                className="scratchpad-area"
                placeholder="Type distractions here to clear your mind..."
                value={scratchpad}
                onChange={(e) => setScratchpad(e.target.value)}
              />
            </div>

            {/* History (Bottom Full) */}
            <div className="glass-panel recent-activity">
              <h3>Session History</h3>
              <div className="list-scroll">
                {sessions.slice().reverse().slice(0, 5).map(s => (
                  <div key={s.id} className="list-item">
                    <div className="item-icon">{s.mode === 'pomodoro' ? '🍅' : '⏱'}</div>
                    <div className="item-details">
                      <strong>{s.topic}</strong>
                      <small>
                        {new Date(s.start).toLocaleDateString()} • {s.breakDuration > 0 ? `Breaks: ${formatTime(s.breakDuration)}` : 'No Breaks'}
                      </small>
                    </div>
                    <div className="item-stats" style={{textAlign: 'right'}}>
                        <div className="item-time">{formatTime(s.duration)}</div>
                        {s.breakPercentage > 0 && (
                            <div style={{fontSize: '0.75rem', color: s.breakPercentage > 30 ? 'var(--danger)' : 'var(--text-muted)'}}>
                                {s.breakPercentage}% Break time
                            </div>
                        )}
                    </div>
                  </div>
                ))}
                {sessions.length === 0 && <p className="empty-text">No sessions yet. Start studying!</p>}
              </div>
            </div>
          </div>
        )}

        {/* --- TIMETABLE --- */}
        {activeTab === 'timetable' && (
          <div className="timetable-container">
            <div className="glass-panel">
              <h2>Smart Schedule</h2>
              <form className="add-task-form" onSubmit={addTask}>
                <input type="time" name="time" required />
                <input type="text" name="task" placeholder="Subject / Task" required />
                <select name="priority">
                  <option value="High">🔥 High</option>
                  <option value="Medium">⚡ Medium</option>
                  <option value="Low">☕ Low</option>
                </select>
                <button type="submit" className="btn-primary">+</button>
              </form>

              <div className="tasks-list">
                {timetable.sort((a, b) => a.time.localeCompare(b.time)).map(t => (
                  <div key={t.id} className={`task-card ${t.completed ? 'completed' : ''} priority-${t.priority.toLowerCase()}`}>
                    <input type="checkbox" checked={t.completed} onChange={() => toggleTask(t.id)} />
                    <span className="task-time">{t.time}</span>
                    <span className="task-name">{t.task}</span>
                    <span className="task-priority">{t.priority}</span>
                    <button className="btn-icon" onClick={() => deleteTask(t.id)}>🗑</button>
                  </div>
                ))}
                 {timetable.length === 0 && <p className="empty-text">Your schedule is clear.</p>}
              </div>
            </div>
          </div>
        )}

        {/* --- ANALYTICS --- */}
        {activeTab === 'analytics' && (
          <div className="analytics-grid">
            <div className="glass-panel chart-panel">
              <h3>Weekly Study Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getWeeklyData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                  <XAxis dataKey="name" stroke="#fff" />
                  <YAxis stroke="#fff" />
                  <Tooltip contentStyle={{backgroundColor: '#151921', border: '1px solid #333', color: '#fff'}} />
                  <Bar dataKey="minutes" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="glass-panel chart-panel">
              <h3>Subject Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie 
                    data={subjectData} cx="50%" cy="50%" 
                    innerRadius={60} outerRadius={80} 
                    paddingAngle={5} dataKey="value"
                  >
                    {subjectData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#2de1c2', '#7b61ff', '#ffb84d', '#ff5c5c'][index % 4]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{backgroundColor: '#151921', border: 'none', color: '#fff'}} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* --- SETTINGS --- */}
        {activeTab === 'settings' && (
          <div className="glass-panel settings-panel">
            <h2>App Settings</h2>
            <div className="setting-group">
              <label>Daily Goal (Minutes)</label>
              <input 
                type="number" 
                value={studyGoal.target} 
                onChange={(e) => setStudyGoal({...studyGoal, target: parseInt(e.target.value)})} 
              />
            </div>
            <div className="setting-group">
               <label>Pomodoro Length (Minutes)</label>
               <input 
                 type="number" 
                 value={settings.pomoTime} 
                 onChange={(e) => setSettings({...settings, pomoTime: parseInt(e.target.value)})} 
               />
            </div>
            <div className="setting-group">
               <label>Data Management</label>
               <button className="btn-danger" onClick={() => {
                 if(window.confirm("Delete all data? This cannot be undone.")) {
                   localStorage.clear();
                   window.location.reload();
                 }
               }}>Reset All Data</button>
            </div>
          </div>
        )}
      </main>

      {/* --- MODALS --- */}
      {modal.open && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content">
            {modal.type === 'pause_reason' && (
              <>
                <h3>Pause Session?</h3>
                <p>What are you doing during this break?</p>
                <form onSubmit={(e) => {
                   e.preventDefault();
                   confirmPause(document.getElementById('pauseInput')?.value);
                }}>
                  <input type="text" placeholder="Reason (e.g. Lunch, Bathroom, Rest)" id="pauseInput" autoFocus />
                  <button type="submit" className="btn-primary" style={{marginTop: '1rem', width: '100%'}}>Start Break Timer</button>
                </form>
              </>
            )}

            {modal.type === 'session_summary' && (
              <>
                <h3>Session Complete! 🎉</h3>
                <p>Great work. What did you focus on?</p>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  saveSession(e.target.topic.value);
                }}>
                  <input type="text" name="topic" placeholder="Topic (e.g. Math, React)" required autoFocus />
                  <button type="submit" className="btn-primary" style={{marginTop: '1rem', width: '100%'}}>Save Session</button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;