const API_BASE = '/api';

export async function fetchDashboard() {
  const response = await fetch(`${API_BASE}/dashboard`);

  if (!response.ok) {
    let message = 'Failed to load dashboard data';

    try {
      const error = await response.json();
      message = error.detail || message;
    } catch {
      // Use the default message.
    }

    throw new Error(message);
  }

  return response.json();
}

export async function refreshDashboard() {
  const response = await fetch(
    `${API_BASE}/dashboard/refresh`,
    {
      method: 'POST',
    }
  );

  if (!response.ok) {
    let message = 'Failed to refresh dashboard data';

    try {
      const error = await response.json();
      message = error.detail || message;
    } catch {
      // Use the default message.
    }

    throw new Error(message);
  }

  return response.json();
}

export async function analyzeWhatIf(scenario) {
  const response = await fetch(`${API_BASE}/what-if/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(scenario),
  });

  if (!response.ok) {
    let message = 'Failed to analyze the what-if scenario';

    try {
      const error = await response.json();
      message = error.detail || message;
    } catch {
      // Use the default message.
    }

    throw new Error(message);
  }

  return response.json();
}

export async function checkBackendHealth() {
  const response = await fetch(`${API_BASE}/health`);

  if (!response.ok) {
    throw new Error('Backend is not responding');
  }

  return response.json();
}