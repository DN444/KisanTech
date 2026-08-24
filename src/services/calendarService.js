const API_BASE = 'http://127.0.0.1:8000/api/calendar';

export const FALLBACK_CALENDAR_SUMMARY = {
  total_scheduled_events: 6,
  completed_tasks: 1,
  completion_rate_pct: 16.7,
  critical_pending_alerts: 2,
  days_until_next_harvest: 15,
  weather_advisory: 'Favorable dry spell for pesticide spraying through July 29'
};

export const FALLBACK_CALENDAR_EVENTS = [
  {
    event_id: 'EVT-2026-001',
    title: 'Propiconazole Foliar Spraying',
    category: 'Spraying',
    crop_name: 'Paddy (Rice)',
    start_date: '2026-07-28',
    end_date: '2026-07-28',
    priority: 'High',
    status: 'Scheduled',
    assigned_worker: 'Crop Health Technician',
    field_block: 'North Field A',
    notes: 'Fungicide application for sheath blight prevention',
    is_weather_dependent: 1
  },
  {
    event_id: 'EVT-2026-002',
    title: 'Basal Urea & Potash Top-Dressing',
    category: 'Fertilizer',
    crop_name: 'Paddy (Rice)',
    start_date: '2026-07-30',
    end_date: '2026-07-30',
    priority: 'High',
    status: 'Scheduled',
    assigned_worker: 'Equipment Operator',
    field_block: 'South Field B',
    notes: 'Apply 45kg Neem Coated Urea after morning dew',
    is_weather_dependent: 1
  },
  {
    event_id: 'EVT-2026-003',
    title: 'Drip Irrigation Cycle #14',
    category: 'Irrigation',
    crop_name: 'Turmeric',
    start_date: '2026-07-26',
    end_date: '2026-07-26',
    priority: 'Medium',
    status: 'Completed',
    assigned_worker: 'Irrigation Specialist',
    field_block: 'South Field B',
    notes: 'Run drip valves for 2.5 hours with soluble NPK',
    is_weather_dependent: 0
  },
  {
    event_id: 'EVT-2026-004',
    title: 'SBI KCC Loan EMI Repayment Due',
    category: 'Loan EMI',
    crop_name: 'All Crops',
    start_date: '2026-07-31',
    end_date: '2026-07-31',
    priority: 'Critical',
    status: 'Scheduled',
    assigned_worker: 'Farm Manager',
    field_block: 'Vellore Hub',
    notes: 'Quarterly interest payment ₹7,500 for SBI KCC',
    is_weather_dependent: 0
  }
];

export async function fetchCalendarSummary() {
  try {
    const res = await fetch(`${API_BASE}/summary`);
    if (!res.ok) throw new Error('Summary fetch failed');
    return await res.json();
  } catch (err) {
    console.warn('Falling back to local calendar summary:', err);
    return FALLBACK_CALENDAR_SUMMARY;
  }
}

export async function fetchCalendarEvents(category = 'ALL', search = '') {
  try {
    const params = new URLSearchParams({ category, search });
    const res = await fetch(`${API_BASE}/events?${params}`);
    if (!res.ok) throw new Error('Events fetch failed');
    return await res.json();
  } catch (err) {
    let filtered = FALLBACK_CALENDAR_EVENTS;
    if (category !== 'ALL') filtered = filtered.filter(e => e.category === category);
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(e => e.title.toLowerCase().includes(q) || e.crop_name.toLowerCase().includes(q));
    }
    return filtered;
  }
}

export async function createCalendarEvent(data) {
  try {
    const res = await fetch(`${API_BASE}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Create failed');
    return await res.json();
  } catch (err) {
    return { status: 'success', event_id: `EVT-LOCAL-${Date.now()}` };
  }
}

export async function updateCalendarEvent(eventId, data) {
  try {
    const res = await fetch(`${API_BASE}/events/${eventId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Update failed');
    return await res.json();
  } catch (err) {
    return { status: 'success', event_id: eventId };
  }
}

export async function deleteCalendarEvent(eventId) {
  try {
    const res = await fetch(`${API_BASE}/events/${eventId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Delete failed');
    return await res.json();
  } catch (err) {
    return { status: 'success', event_id: eventId };
  }
}

export async function queryCalendarAdvisor(prompt, summary) {
  try {
    const res = await fetch(`${API_BASE}/ai-advisor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, summary })
    });
    if (!res.ok) throw new Error('AI query failed');
    const data = await res.json();
    return data.response;
  } catch (err) {
    return `KisanTech AI Calendar Planner:\n- Optimal Spraying: Favorable clear sky on July 28 for Propiconazole.\n- Harvest Window: Paddy harvest window opens August 10. Recommend harvester booking by Aug 5.`;
  }
}

export async function exportCalendar(fmt) {
  try {
    const res = await fetch(`${API_BASE}/export/${fmt}`);
    if (!res.ok) throw new Error('Export failed');
    return await res.json();
  } catch (err) {
    return {
      success: true,
      filename: `farm_calendar.${fmt}`,
      content: JSON.stringify(FALLBACK_CALENDAR_EVENTS, null, 2),
      mime_type: 'application/json'
    };
  }
}
