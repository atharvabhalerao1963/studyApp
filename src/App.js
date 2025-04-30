// import React, { useState, useEffect } from 'react';
// import './App.css';

// function App() {
//   const [studyStatus, setStudyStatus] = useState('not-started');
//   const [startTime, setStartTime] = useState(null);
//   const [endTime, setEndTime] = useState(null);
//   const [pauseReason, setPauseReason] = useState('');
//   const [studySessions, setStudySessions] = useState([]);
//   const [totalStudyTime, setTotalStudyTime] = useState(0);
//   const [currentSessionTime, setCurrentSessionTime] = useState(0);
//   const [pauseStartTime, setPauseStartTime] = useState(null);
//   const [totalPausedTime, setTotalPausedTime] = useState(0);
//   const [currentBreakTime, setCurrentBreakTime] = useState(0);
//   const [studyTopic, setStudyTopic] = useState('');
//   const [showTimetable, setShowTimetable] = useState(false);
//   const [timetable, setTimetable] = useState([]);
//   const [newTask, setNewTask] = useState({ time: '', topic: '' });
//   const [userInfo, setUserInfo] = useState(null);
//   const [name, setName] = useState('');
//   const [email, setEmail] = useState('');

//   // Check for user info on initial load
//   useEffect(() => {
//     const savedUserInfo = localStorage.getItem('studyAppUserInfo');
//     if (savedUserInfo) {
//       setUserInfo(JSON.parse(savedUserInfo));
//     }
//   }, []);

//   // Format time for display
//   const formatTime = (timeInSeconds) => {
//     const hours = Math.floor(timeInSeconds / 3600);
//     const minutes = Math.floor((timeInSeconds % 3600) / 60);
//     const seconds = timeInSeconds % 60;
//     return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
//   };

//   // Save user info
//   const saveUserInfo = (e) => {
//     e.preventDefault();
//     const userData = { name, email };
//     setUserInfo(userData);
//     localStorage.setItem('studyAppUserInfo', JSON.stringify(userData));
//   };

//   // Calculate average study time
//   const calculateAverageTime = () => {
//     if (studySessions.length === 0) return 0;
//     const total = studySessions.reduce((sum, session) => sum + session.duration, 0);
//     return Math.floor(total / studySessions.length);
//   };

//   // Calculate average break time
//   const calculateAverageBreakTime = () => {
//     if (studySessions.length === 0) return 0;
//     const total = studySessions.reduce((sum, session) => sum + (session.pausedTime || 0), 0);
//     return Math.floor(total / studySessions.length);
//   };

//   // Start studying
//   const startStudy = () => {
//     setStudyStatus('studying');
//     setStartTime(new Date());
//     setEndTime(null);
//     setPauseReason('');
//     setCurrentSessionTime(0);
//     setTotalPausedTime(0);
//     setCurrentBreakTime(0);
//   };

//   // Pause studying
//   const pauseStudy = () => {
//     const reason = prompt("Why are you pausing your study session?");
//     if (reason !== null) {
//       setStudyStatus('paused');
//       setPauseReason(reason);
//       setPauseStartTime(new Date());
//       setCurrentBreakTime(0);
//     }
//   };

//   // Resume studying
//   const resumeStudy = () => {
//     if (pauseStartTime) {
//       const pauseDuration = Math.floor((new Date() - pauseStartTime) / 1000);
//       setTotalPausedTime(prev => prev + pauseDuration);
//     }
//     setStudyStatus('studying');
//     setPauseStartTime(null);
//   };

//   // End studying
//   const endStudy = () => {
//     const now = new Date();
//     setStudyStatus('ended');
//     setEndTime(now);
    
//     const duration = Math.floor((now - startTime) / 1000) - totalPausedTime;
//     setCurrentSessionTime(duration);
    
//     const topic = prompt("What did you study in this session?");
//     if (topic === null) return; // User cancelled
    
//     const newSession = {
//       start: startTime,
//       end: now,
//       duration: duration,
//       pauseReason: pauseReason,
//       pausedTime: totalPausedTime,
//       topic: topic
//     };
    
//     setStudySessions([...studySessions, newSession]);
//     setTotalStudyTime(totalStudyTime + duration);
//     setStudyTopic(topic);
//   };

//   // Timetable functions
//   const toggleTimetable = () => {
//     setShowTimetable(!showTimetable);
//   };

//   const handleTaskInputChange = (e) => {
//     const { name, value } = e.target;
//     setNewTask(prev => ({ ...prev, [name]: value }));
//   };

//   const addTask = () => {
//     if (newTask.time && newTask.topic) {
//       setTimetable([...timetable, newTask]);
//       setNewTask({ time: '', topic: '' });
//     }
//   };

//   const removeTask = (index) => {
//     const updatedTimetable = [...timetable];
//     updatedTimetable.splice(index, 1);
//     setTimetable(updatedTimetable);
//   };

//   // Timer effects
//   useEffect(() => {
//     let interval;
//     if (studyStatus === 'studying') {
//       interval = setInterval(() => {
//         setCurrentSessionTime(Math.floor((new Date() - startTime) / 1000) - totalPausedTime);
//       }, 1000);
//     }
//     return () => clearInterval(interval);
//   }, [studyStatus, startTime, totalPausedTime]);

//   // Break timer effect
//   useEffect(() => {
//     let interval;
//     if (studyStatus === 'paused' && pauseStartTime) {
//       interval = setInterval(() => {
//         setCurrentBreakTime(Math.floor((new Date() - pauseStartTime) / 1000));
//       }, 1000);
//     }
//     return () => clearInterval(interval);
//   }, [studyStatus, pauseStartTime]);

//   // Show welcome screen if user info not set
//   if (!userInfo) {
//     return (
//       <div className="app dark-mode welcome-screen">
//         <div className="welcome-container glass-card">
//           <h1>Welcome to Study<span className="accent">App</span></h1>
//           <p className="app-subtitle">Let's get you set up</p>
          
//           <form onSubmit={saveUserInfo} className="user-form">
//             <div className="form-group">
//               <label htmlFor="name">Your Name:</label>
//               <input
//                 type="text"
//                 id="name"
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//                 required
//                 placeholder="Enter your name"
//               />
//             </div>
            
//             <div className="form-group">
//               <label htmlFor="email">Email (optional):</label>
//               <input
//                 type="email"
//                 id="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 placeholder="Enter your email"
//               />
//             </div>
            
//             <button type="submit" className="control-btn start-btn">
//               Get Started
//             </button>
//           </form>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="app dark-mode">
//       <header className="app-header">
//         <h1>Study<span className="accent">App</span></h1>
//         <p className="app-subtitle">Welcome back, {userInfo.name}</p>
//       </header>
      
//       <div className="study-controls">
//         <div className="session-controls">
//           {studyStatus === 'not-started' ? (
//             <button className="control-btn start-btn" onClick={startStudy}>
//               <span className="icon">▶</span> Start Session
//             </button>
//           ) : studyStatus === 'studying' ? (
//             <button className="control-btn pause-btn" onClick={pauseStudy}>
//               <span className="icon">⏸</span> Take Break
//             </button>
//           ) : studyStatus === 'paused' ? (
//             <div className="pause-options">
//               <button className="control-btn resume-btn" onClick={resumeStudy}>
//                 <span className="icon">▶</span> Resume
//               </button>
//               <button className="control-btn end-btn" onClick={endStudy}>
//                 <span className="icon">⏹</span> End Session
//               </button>
//             </div>
//           ) : (
//             <button className="control-btn start-btn" onClick={startStudy}>
//               <span className="icon">▶</span> New Session
//             </button>
//           )}
//         </div>
        
//         <button className="control-btn timetable-btn" onClick={toggleTimetable}>
//           <span className="icon">🗓️</span> {showTimetable ? 'Hide' : 'Show'} Timetable
//         </button>
//       </div>

//       {showTimetable && (
//         <div className="timetable-container glass-card">
//           <h2 className="section-title">
//             <span className="icon">🗓️</span> Daily Timetable
//           </h2>
//           <div className="timetable-form">
//             <input
//               type="time"
//               name="time"
//               value={newTask.time}
//               onChange={handleTaskInputChange}
//               className="timetable-input"
//               placeholder="Time"
//             />
//             <input
//               type="text"
//               name="topic"
//               value={newTask.topic}
//               onChange={handleTaskInputChange}
//               className="timetable-input"
//               placeholder="Topic/Subject"
//             />
//             <button className="control-btn add-btn" onClick={addTask}>
//               <span className="icon">+</span> Add
//             </button>
//           </div>
//           {timetable.length > 0 ? (
//             <div className="timetable-list">
//               {timetable
//                 .sort((a, b) => a.time.localeCompare(b.time))
//                 .map((task, index) => (
//                   <div className="timetable-item" key={index}>
//                     <span className="timetable-time">{task.time}</span>
//                     <span className="timetable-topic">{task.topic}</span>
//                     <button 
//                       className="timetable-remove" 
//                       onClick={() => removeTask(index)}
//                     >
//                       ×
//                     </button>
//                   </div>
//                 ))}
//             </div>
//           ) : (
//             <p className="timetable-empty">No tasks added yet. Plan your day!</p>
//           )}
//         </div>
//       )}
      
//       <div className="current-session glass-card">
//         <h2 className="section-title">
//           <span className="icon">⏱</span> Current Session
//         </h2>
//         {studyStatus !== 'not-started' && (
//           <div className="session-info">
//             <div className="status-container">
//               <div className={`status-indicator ${studyStatus}`}>
//                 <div className="status-light"></div>
//                 <span>
//                   {studyStatus === 'studying' ? 'Studying' : 
//                    studyStatus === 'paused' ? 'On Break' : 'Session Ended'}
//                 </span>
//               </div>
//               {studyTopic && (
//                 <div className="study-topic">
//                   <span className="topic-label">Topic:</span>
//                   <span className="topic-value">"{studyTopic}"</span>
//                 </div>
//               )}
//               <div className="time-displays">
//                 <div className="time-display">
//                   <span className="time-label">Started:</span>
//                   <span className="time-value">{startTime?.toLocaleTimeString()}</span>
//                 </div>
//                 <div className="time-display">
//                   <span className="time-label">Study Time:</span>
//                   <span className="time-value highlight">{formatTime(currentSessionTime)}</span>
//                 </div>
//                 {studyStatus === 'paused' && (
//                   <div className="time-display">
//                     <span className="time-label">Break Time:</span>
//                     <span className="time-value break">{formatTime(currentBreakTime)}</span>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
      
//       {pauseReason && studyStatus === 'paused' && (
//         <div className="pause-reason glass-card">
//           <h2 className="section-title">
//             <span className="icon">📝</span> Break Reason
//           </h2>
//           <p className="reason-text">"{pauseReason}"</p>
//         </div>
//       )}
      
//       <div className="study-summary glass-card">
//         <h2 className="section-title">
//           <span className="icon">📊</span> Analytics
//         </h2>
//         <div className="stats-grid">
//           <div className="stat-card">
//             <div className="stat-icon">🕒</div>
//             <div className="stat-value">{formatTime(totalStudyTime + (studyStatus === 'studying' ? currentSessionTime : 0))}</div>
//             <div className="stat-label">Total Study Time</div>
//           </div>
//           <div className="stat-card">
//             <div className="stat-icon text-2xl">🗓️</div>
//             <div className="stat-value">
//               {studySessions.length + (studyStatus !== 'not-started' ? 1 : 0)}
//             </div>
//             <div className="stat-label">Sessions</div>
//           </div>
//           <div className="stat-card">
//             <div className="stat-icon">⏳</div>
//             <div className="stat-value">{formatTime(calculateAverageTime())}</div>
//             <div className="stat-label">Avg Session</div>
//           </div>
//           <div className="stat-card">
//             <div className="stat-icon">☕</div>
//             <div className="stat-value">{formatTime(calculateAverageBreakTime())}</div>
//             <div className="stat-label">Avg Break</div>
//           </div>
//         </div>
        
//         {studySessions.length > 0 && (
//           <div className="session-history">
//             <h2 className="section-title">
//               <span className="icon">📜</span> Session History
//             </h2>
//             <div className="history-scroll">
//               {studySessions.slice().reverse().map((session, index) => (
//                 <div className="history-card" key={index}>
//                   <div className="card-header">
//                     <h3>Session {studySessions.length - index}</h3>
//                     <div className="session-duration highlight">
//                       {formatTime(session.duration)}
//                     </div>
//                   </div>
//                   <div className="card-details">
//                     <div className="detail-item">
//                       <span className="detail-label">⏱ Time:</span>
//                       <span>{session.start.toLocaleTimeString()} - {session.end.toLocaleTimeString()}</span>
//                     </div>
//                     <div className="detail-item">
//                       <span className="detail-label">📚 Topic:</span>
//                       <span className="topic-value">"{session.topic}"</span>
//                     </div>
//                     <div className="detail-item">
//                       <span className="detail-label">⏸ Breaks:</span>
//                       <span>{formatTime(session.pausedTime || 0)}</span>
//                     </div>
//                     {session.pauseReason && (
//                       <div className="detail-item">
//                         <span className="detail-label">📝 Reason:</span>
//                         <span className="break-reason">"{session.pauseReason}"</span>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>
      
//       <footer className="app-footer">
//         <p>Stay focused and productive with FocusTrack</p>
//         <p>© 2025 Atharva Bhalerao. All rights reserved.</p>
//       </footer>
//     </div>
//   );
// }

// export default App;

// // new 2nd code below this 




import React, { useState, useEffect } from 'react';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import './App.css';
// import axios from 'axios';
// axios.defaults.baseURL = 'http://localhost:5000';

function App() {
  const [studyStatus, setStudyStatus] = useState('not-started');
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [pauseReason, setPauseReason] = useState('');
  const [studySessions, setStudySessions] = useState([]);
  const [totalStudyTime, setTotalStudyTime] = useState(0);
  const [currentSessionTime, setCurrentSessionTime] = useState(0);
  const [pauseStartTime, setPauseStartTime] = useState(null);
  const [totalPausedTime, setTotalPausedTime] = useState(0);
  const [currentBreakTime, setCurrentBreakTime] = useState(0);
  const [studyTopic, setStudyTopic] = useState('');
  const [showTimetable, setShowTimetable] = useState(false);
  const [timetable, setTimetable] = useState([]);
  const [newTask, setNewTask] = useState({ time: '', topic: '' });
  const [userInfo, setUserInfo] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [timeRange, setTimeRange] = useState('week');
  const [studyGoal, setStudyGoal] = useState(0);
  const [goalTimeframe, setGoalTimeframe] = useState('daily');

  // Check for user info on initial load
  useEffect(() => {
    const savedUserInfo = localStorage.getItem('studyAppUserInfo');
    const savedGoal = localStorage.getItem('studyAppGoal');
    if (savedUserInfo) {
      setUserInfo(JSON.parse(savedUserInfo));
    }
    if (savedGoal) {
      setStudyGoal(JSON.parse(savedGoal).goal);
      setGoalTimeframe(JSON.parse(savedGoal).timeframe);
    }
  }, []);

  // Format time for display
  const formatTime = (timeInSeconds) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Save user info
  const saveUserInfo = (e) => {
    e.preventDefault();
    const userData = { name, email };
    setUserInfo(userData);
    localStorage.setItem('studyAppUserInfo', JSON.stringify(userData));
  };

  // Save study goal
  const saveStudyGoal = (e) => {
    e.preventDefault();
    const goalData = { goal: studyGoal, timeframe: goalTimeframe };
    localStorage.setItem('studyAppGoal', JSON.stringify(goalData));
  };

  // Calculate average study time
  const calculateAverageTime = () => {
    if (studySessions.length === 0) return 0;
    const total = studySessions.reduce((sum, session) => sum + session.duration, 0);
    return Math.floor(total / studySessions.length);
  };

  // Calculate average break time
  const calculateAverageBreakTime = () => {
    if (studySessions.length === 0) return 0;
    const total = studySessions.reduce((sum, session) => sum + (session.pausedTime || 0), 0);
    return Math.floor(total / studySessions.length);
  };

  // Calculate productivity score (0-100)
  const calculateProductivityScore = () => {
    if (studySessions.length === 0) return 0;
    const totalStudy = studySessions.reduce((sum, session) => sum + session.duration, 0);
    const totalBreak = studySessions.reduce((sum, session) => sum + (session.pausedTime || 0), 0);
    const ratio = totalStudy / (totalStudy + totalBreak);
    return Math.min(100, Math.floor(ratio * 100 * 1.2)); // 1.2 multiplier to get closer to 100 for good ratios
  };

  // Prepare data for subject distribution pie chart
  const getSubjectDistributionData = () => {
    const subjectMap = {};
    
    studySessions.forEach(session => {
      if (session.topic) {
        subjectMap[session.topic] = (subjectMap[session.topic] || 0) + session.duration;
      }
    });
    
    return Object.entries(subjectMap).map(([name, value]) => ({
      name,
      value: Math.floor(value / 60) // Convert to minutes for better readability
    })).sort((a, b) => b.value - a.value);
  };

  // Prepare data for weekly/monthly trends
  const getTimeTrendData = () => {
    const now = new Date();
    const data = [];
    const daysToShow = timeRange === 'week' ? 7 : 30;
    const sessionGroups = {};
    
    // Group sessions by day
    studySessions.forEach(session => {
      const dateStr = session.start.toDateString();
      if (!sessionGroups[dateStr]) {
        sessionGroups[dateStr] = {
          date: session.start,
          studyTime: 0,
          breakTime: 0
        };
      }
      sessionGroups[dateStr].studyTime += session.duration;
      sessionGroups[dateStr].breakTime += (session.pausedTime || 0);
    });
    
    // Create data for last X days
    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();
      const dayData = sessionGroups[dateStr] || {
        date,
        studyTime: 0,
        breakTime: 0
      };
      
      data.push({
        name: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        studyTime: Math.floor(dayData.studyTime / 60), // in minutes
        breakTime: Math.floor(dayData.breakTime / 60)   // in minutes
      });
    }
    
    return data;
  };

  // Calculate goal progress
  const calculateGoalProgress = () => {
    if (studyGoal <= 0) return 0;
    
    const now = new Date();
    let relevantSessions = [];
    
    if (goalTimeframe === 'daily') {
      const today = now.toDateString();
      relevantSessions = studySessions.filter(session => 
        session.start.toDateString() === today
      );
    } else if (goalTimeframe === 'weekly') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      relevantSessions = studySessions.filter(session => 
        session.start > oneWeekAgo
      );
    } else { // monthly
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      relevantSessions = studySessions.filter(session => 
        session.start > oneMonthAgo
      );
    }
    
    const totalTime = relevantSessions.reduce((sum, session) => sum + session.duration, 0);
    return Math.min(100, Math.floor((totalTime / studyGoal) * 100));
  };

  // Start studying
  const startStudy = () => {
    setStudyStatus('studying');
    setStartTime(new Date());
    setEndTime(null);
    setPauseReason('');
    setCurrentSessionTime(0);
    setTotalPausedTime(0);
    setCurrentBreakTime(0);
  };

  // Pause studying
  const pauseStudy = () => {
    const reason = prompt("Why are you pausing your study session?");
    if (reason !== null) {
      setStudyStatus('paused');
      setPauseReason(reason);
      setPauseStartTime(new Date());
      setCurrentBreakTime(0);
    }
  };

  // Resume studying
  const resumeStudy = () => {
    if (pauseStartTime) {
      const pauseDuration = Math.floor((new Date() - pauseStartTime) / 1000);
      setTotalPausedTime(prev => prev + pauseDuration);
    }
    setStudyStatus('studying');
    setPauseStartTime(null);
  };

  // End studying
  const endStudy = () => {
    const now = new Date();
    setStudyStatus('ended');
    setEndTime(now);
    
    const duration = Math.floor((now - startTime) / 1000) - totalPausedTime;
    setCurrentSessionTime(duration);
    
    const topic = prompt("What did you study in this session?");
    if (topic === null) return; // User cancelled
    
    const newSession = {
      start: startTime,
      end: now,
      duration: duration,
      pauseReason: pauseReason,
      pausedTime: totalPausedTime,
      topic: topic
    };
    
    setStudySessions([...studySessions, newSession]);
    setTotalStudyTime(totalStudyTime + duration);
    setStudyTopic(topic);
  };

  // Timetable functions
  const toggleTimetable = () => {
    setShowTimetable(!showTimetable);
  };

  const handleTaskInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask(prev => ({ ...prev, [name]: value }));
  };

  const addTask = () => {
    if (newTask.time && newTask.topic) {
      setTimetable([...timetable, newTask]);
      setNewTask({ time: '', topic: '' });
    }
  };

  const removeTask = (index) => {
    const updatedTimetable = [...timetable];
    updatedTimetable.splice(index, 1);
    setTimetable(updatedTimetable);
  };

  // Timer effects
  useEffect(() => {
    let interval;
    if (studyStatus === 'studying') {
      interval = setInterval(() => {
        setCurrentSessionTime(Math.floor((new Date() - startTime) / 1000) - totalPausedTime);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [studyStatus, startTime, totalPausedTime]);

  // Break timer effect
  useEffect(() => {
    let interval;
    if (studyStatus === 'paused' && pauseStartTime) {
      interval = setInterval(() => {
        setCurrentBreakTime(Math.floor((new Date() - pauseStartTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [studyStatus, pauseStartTime]);

  // Show welcome screen if user info not set
  if (!userInfo) {
    return (
      <div className="app dark-mode welcome-screen">
        <div className="welcome-container glass-card">
          <h1>Welcome to Study<span className="accent">App</span></h1>
          <p className="app-subtitle">Let's get you set up</p>
          
          <form onSubmit={saveUserInfo} className="user-form">
            <div className="form-group">
              <label htmlFor="name">Your Name:</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Enter your name"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email (optional):</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>
            
            <button type="submit" className="control-btn start-btn">
              Get Started
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Data for charts
  const subjectData = getSubjectDistributionData();
  const trendData = getTimeTrendData();
  const productivityScore = calculateProductivityScore();
  const goalProgress = calculateGoalProgress();

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  return (
    <div className="app dark-mode">
      <header className="app-header">
        <h1>Study<span className="accent">App</span></h1>
        <p className="app-subtitle">Welcome back, {userInfo.name}</p>
      </header>
      
      <div className="study-controls">
        <div className="session-controls">
          {studyStatus === 'not-started' ? (
            <button className="control-btn start-btn" onClick={startStudy}>
              <span className="icon">▶</span> Start Session
            </button>
          ) : studyStatus === 'studying' ? (
            <button className="control-btn pause-btn" onClick={pauseStudy}>
              <span className="icon">⏸</span> Take Break
            </button>
          ) : studyStatus === 'paused' ? (
            <div className="pause-options">
              <button className="control-btn resume-btn" onClick={resumeStudy}>
                <span className="icon">▶</span> Resume
              </button>
              <button className="control-btn end-btn" onClick={endStudy}>
                <span className="icon">⏹</span> End Session
              </button>
            </div>
          ) : (
            <button className="control-btn start-btn" onClick={startStudy}>
              <span className="icon">▶</span> New Session
            </button>
          )}
        </div>
        
        <button className="control-btn timetable-btn" onClick={toggleTimetable}>
          <span className="icon">🗓️</span> {showTimetable ? 'Hide' : 'Show'} Timetable
        </button>

        <button className="control-btn analytics-btn" onClick={() => setShowAnalytics(!showAnalytics)}>
          <span className="icon">📊</span> {showAnalytics ? 'Hide' : 'Show'} Analytics
        </button>
      </div>

      {showAnalytics && (
        <div className="analytics-dashboard glass-card">
          <h2 className="section-title">
            <span className="icon">📊</span> Advanced Analytics
          </h2>

          <div className="time-range-selector">
            <button 
              className={`range-btn ${timeRange === 'week' ? 'active' : ''}`}
              onClick={() => setTimeRange('week')}
            >
              Weekly
            </button>
            <button 
              className={`range-btn ${timeRange === 'month' ? 'active' : ''}`}
              onClick={() => setTimeRange('month')}
            >
              Monthly
            </button>
          </div>

          <div className="analytics-grid">
            {/* Productivity Score */}
            <div className="analytics-card">
              <h3>Productivity Score</h3>
              <div className="score-container">
                <div className="circular-progress" style={{ '--progress': productivityScore }}>
                  <div className="progress-circle">
                    <div className="progress-value">{productivityScore}</div>
                  </div>
                </div>
                <p className="score-description">
                  {productivityScore > 80 ? 'Excellent focus!' : 
                   productivityScore > 60 ? 'Good work!' : 
                   productivityScore > 40 ? 'Room for improvement' : 'Try to focus more'}
                </p>
              </div>
            </div>

            {/* Study Time Trends */}
            <div className="analytics-card wide-card">
              <h3>Study Time Trends</h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="studyTime" name="Study Time" fill="#8884d8" />
                    <Bar dataKey="breakTime" name="Break Time" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Subject Distribution */}
            <div className="analytics-card">
              <h3>Subject Distribution</h3>
              <div className="chart-container">
                {subjectData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={subjectData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {subjectData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} minutes`, 'Study Time']} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="no-data">No subject data available</p>
                )}
              </div>
            </div>

            {/* Goal Tracking */}
            <div className="analytics-card">
              <h3>Study Goal Progress</h3>
              <form onSubmit={saveStudyGoal} className="goal-form">
                <div className="form-group">
                  <label>Goal (minutes):</label>
                  <input
                    type="number"
                    value={studyGoal}
                    onChange={(e) => setStudyGoal(Number(e.target.value))}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Timeframe:</label>
                  <select 
                    value={goalTimeframe}
                    onChange={(e) => setGoalTimeframe(e.target.value)}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <button type="submit" className="control-btn">
                  Set Goal
                </button>
              </form>
              <div className="goal-progress">
                <div className="progress-bar-container">
                  <div 
                    className="progress-bar" 
                    style={{ width: `${goalProgress}%` }}
                  ></div>
                </div>
                <div className="progress-text">
                  {goalProgress}% of {studyGoal} minute {goalTimeframe} goal
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showTimetable && (
        <div className="timetable-container glass-card">
          <h2 className="section-title">
            <span className="icon">🗓️</span> Daily Timetable
          </h2>
          <div className="timetable-form">
            <input
              type="time"
              name="time"
              value={newTask.time}
              onChange={handleTaskInputChange}
              className="timetable-input"
              placeholder="Time"
            />
            <input
              type="text"
              name="topic"
              value={newTask.topic}
              onChange={handleTaskInputChange}
              className="timetable-input"
              placeholder="Topic/Subject"
            />
            <button className="control-btn add-btn" onClick={addTask}>
              <span className="icon">+</span> Add
            </button>
          </div>
          {timetable.length > 0 ? (
            <div className="timetable-list">
              {timetable
                .sort((a, b) => a.time.localeCompare(b.time))
                .map((task, index) => (
                  <div className="timetable-item" key={index}>
                    <span className="timetable-time">{task.time}</span>
                    <span className="timetable-topic">{task.topic}</span>
                    <button 
                      className="timetable-remove" 
                      onClick={() => removeTask(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
            </div>
          ) : (
            <p className="timetable-empty">No tasks added yet. Plan your day!</p>
          )}
        </div>
      )}
      
      <div className="current-session glass-card">
        <h2 className="section-title">
          <span className="icon">⏱</span> Current Session
        </h2>
        {studyStatus !== 'not-started' && (
          <div className="session-info">
            <div className="status-container">
              <div className={`status-indicator ${studyStatus}`}>
                <div className="status-light"></div>
                <span>
                  {studyStatus === 'studying' ? 'Studying' : 
                   studyStatus === 'paused' ? 'On Break' : 'Session Ended'}
                </span>
              </div>
              {studyTopic && (
                <div className="study-topic">
                  <span className="topic-label">Topic:</span>
                  <span className="topic-value">"{studyTopic}"</span>
                </div>
              )}
              <div className="time-displays">
                <div className="time-display">
                  <span className="time-label">Started:</span>
                  <span className="time-value">{startTime?.toLocaleTimeString()}</span>
                </div>
                <div className="time-display">
                  <span className="time-label">Study Time:</span>
                  <span className="time-value highlight">{formatTime(currentSessionTime)}</span>
                </div>
                {studyStatus === 'paused' && (
                  <div className="time-display">
                    <span className="time-label">Break Time:</span>
                    <span className="time-value break">{formatTime(currentBreakTime)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {pauseReason && studyStatus === 'paused' && (
        <div className="pause-reason glass-card">
          <h2 className="section-title">
            <span className="icon">📝</span> Break Reason
          </h2>
          <p className="reason-text">"{pauseReason}"</p>
        </div>
      )}
      
      <div className="study-summary glass-card">
        <h2 className="section-title">
          <span className="icon">📊</span> Analytics
        </h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🕒</div>
            <div className="stat-value">{formatTime(totalStudyTime + (studyStatus === 'studying' ? currentSessionTime : 0))}</div>
            <div className="stat-label">Total Study Time</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon text-2xl">🗓️</div>
            <div className="stat-value">
              {studySessions.length + (studyStatus !== 'not-started' ? 1 : 0)}
            </div>
            <div className="stat-label">Sessions</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-value">{formatTime(calculateAverageTime())}</div>
            <div className="stat-label">Avg Session</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">☕</div>
            <div className="stat-value">{formatTime(calculateAverageBreakTime())}</div>
            <div className="stat-label">Avg Break</div>
          </div>
        </div>
        
        {studySessions.length > 0 && (
          <div className="session-history">
            <h2 className="section-title">
              <span className="icon">📜</span> Session History
            </h2>
            <div className="history-scroll">
              {studySessions.slice().reverse().map((session, index) => (
                <div className="history-card" key={index}>
                  <div className="card-header">
                    <h3>Session {studySessions.length - index}</h3>
                    <div className="session-duration highlight">
                      {formatTime(session.duration)}
                    </div>
                  </div>
                  <div className="card-details">
                    <div className="detail-item">
                      <span className="detail-label">⏱ Time:</span>
                      <span>{session.start.toLocaleTimeString()} - {session.end.toLocaleTimeString()}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">📚 Topic:</span>
                      <span className="topic-value">"{session.topic}"</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">⏸ Breaks:</span>
                      <span>{formatTime(session.pausedTime || 0)}</span>
                    </div>
                    {session.pauseReason && (
                      <div className="detail-item">
                        <span className="detail-label">📝 Reason:</span>
                        <span className="break-reason">"{session.pauseReason}"</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <footer className="app-footer">
        <p>Stay focused and productive with StudyApp</p>
        <p>© 2025 Atharva Bhalerao. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;



