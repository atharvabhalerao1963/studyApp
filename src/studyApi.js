const API_BASE = 'http://localhost:5000/api';

export const startStudySession = async (startTime, subject = 'General Study') => {
  const response = await fetch(`${API_BASE}/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      start_time: startTime.toISOString(),
      subject: subject,
      notes: ''
    }),
  });
  return await response.json();
};

export const endStudySession = async (sessionId, endTime, duration) => {
  const response = await fetch(`${API_BASE}/sessions/${sessionId}/end`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      end_time: endTime.toISOString(),
      duration_minutes: Math.floor(duration / 60)
    }),
  });
  return await response.json();
};

export const startBreak = async (sessionId, startTime, reason) => {
  const response = await fetch(`${API_BASE}/breaks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      session_id: sessionId,
      start_time: startTime.toISOString(),
      break_type: reason || 'short'
    }),
  });
  return await response.json();
};

export const endBreak = async (breakId, endTime, duration) => {
  const response = await fetch(`${API_BASE}/breaks/${breakId}/end`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      end_time: endTime.toISOString(),
      duration_minutes: Math.floor(duration / 60)
    }),
  });
  return await response.json();
};