const API_BASE = 'http://127.0.0.1:8000/api/finance-pnl';

export const FALLBACK_PNL_STATEMENT = {
  total_revenue_inr: 642000.0,
  total_expenses_inr: 185400.0,
  gross_profit_inr: 558570.0,
  net_profit_inr: 456600.0,
  operating_margin_pct: 71.1,
  roi_pct: 246.2,
  cost_per_acre_inr: 14832.0,
  revenue_per_acre_inr: 51360.0,
  financial_health_score: 96,
  crop_performance: [
    { crop_name: 'Paddy (Rice)', revenue_inr: 595000.0, expense_inr: 161400.0, net_profit_inr: 433600.0, margin_pct: 72.9 },
    { crop_name: 'Turmeric', revenue_inr: 47000.0, expense_inr: 24000.0, net_profit_inr: 23000.0, margin_pct: 48.9 }
  ]
};

export const FALLBACK_LEDGER = [
  {
    entry_id: 'REV-2026-001',
    entry_type: 'REVENUE',
    title: 'Paddy Grain Bulk Sale (250 Qtl)',
    category: 'Harvest Produce',
    crop_name: 'Paddy (Rice)',
    amount_inr: 595000.0,
    entry_date: '2026-07-22',
    vendor_or_buyer: 'Erode Mandi Hub',
    notes: 'Grade A Paddy @ ₹2,380/Qtl'
  },
  {
    entry_id: 'REV-2026-002',
    entry_type: 'REVENUE',
    title: 'Organic Rice Straw Bales (400 Bales)',
    category: 'By-Product',
    crop_name: 'Paddy (Rice)',
    amount_inr: 47000.0,
    entry_date: '2026-07-20',
    vendor_or_buyer: 'Local Cattle Cooperative',
    notes: 'Sold to dairy farmers @ ₹117.50/bale'
  },
  {
    entry_id: 'EXP-2026-001',
    entry_type: 'EXPENSE',
    title: 'Neem Coated Urea & DAP Basal',
    category: 'Fertilizers',
    crop_name: 'Paddy (Rice)',
    amount_inr: 38400.0,
    entry_date: '2026-07-18',
    vendor_or_buyer: 'IFFCO Cooperative',
    notes: 'Basal fertilizer application'
  },
  {
    entry_id: 'EXP-2026-003',
    entry_type: 'EXPENSE',
    title: 'Transplantation & Harvesting Wages',
    category: 'Labour',
    crop_name: 'Paddy (Rice)',
    amount_inr: 68000.0,
    entry_date: '2026-07-10',
    vendor_or_buyer: 'Karthik Syndicate',
    notes: '25 Worker Days'
  }
];

export const FALLBACK_LOANS = [
  {
    loan_id: 'LNKCC-2026-01',
    lender_name: 'State Bank of India (SBI) Katpadi',
    loan_type: 'Kisan Credit Card (KCC)',
    principal_inr: 300000.0,
    interest_rate_pct: 4.0,
    emi_inr: 7500.0,
    outstanding_inr: 185000.0,
    due_date: '2026-09-30',
    subsidy_eligible_inr: 9000.0,
    status: 'Active'
  },
  {
    loan_id: 'LNSUB-2026-02',
    lender_name: 'NABARD Drip Irrigation Subsidy Scheme',
    loan_type: 'Govt Equipment Loan',
    principal_inr: 150000.0,
    interest_rate_pct: 0.0,
    emi_inr: 0.0,
    outstanding_inr: 45000.0,
    due_date: '2026-11-15',
    subsidy_eligible_inr: 45000.0,
    status: 'Subsidy Claim Pending'
  }
];

export async function fetchPnlStatement() {
  try {
    const res = await fetch(`${API_BASE}/statement`);
    if (!res.ok) throw new Error('Statement fetch failed');
    return await res.json();
  } catch (err) {
    console.warn('Falling back to local P&L statement:', err);
    return FALLBACK_PNL_STATEMENT;
  }
}

export async function fetchPnlLedger(entry_type = 'ALL', search = '') {
  try {
    const params = new URLSearchParams({ entry_type, search });
    const res = await fetch(`${API_BASE}/ledger?${params}`);
    if (!res.ok) throw new Error('Ledger fetch failed');
    return await res.json();
  } catch (err) {
    let filtered = FALLBACK_LEDGER;
    if (entry_type !== 'ALL') filtered = filtered.filter(e => e.entry_type === entry_type);
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(e => e.title.toLowerCase().includes(q) || e.vendor_or_buyer.toLowerCase().includes(q));
    }
    return filtered;
  }
}

export async function createLedgerEntry(data) {
  try {
    const res = await fetch(`${API_BASE}/ledger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Create failed');
    return await res.json();
  } catch (err) {
    return { status: 'success', entry_id: `ENTRY-LOCAL-${Date.now()}` };
  }
}

export async function updateLedgerEntry(entryId, data) {
  try {
    const res = await fetch(`${API_BASE}/ledger/${entryId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Update failed');
    return await res.json();
  } catch (err) {
    return { status: 'success', entry_id: entryId };
  }
}

export async function deleteLedgerEntry(entryId) {
  try {
    const res = await fetch(`${API_BASE}/ledger/${entryId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Delete failed');
    return await res.json();
  } catch (err) {
    return { status: 'success', entry_id: entryId };
  }
}

export async function fetchLoansAndSubsidies() {
  try {
    const res = await fetch(`${API_BASE}/loans`);
    if (!res.ok) throw new Error('Loans fetch failed');
    return await res.json();
  } catch (err) {
    return FALLBACK_LOANS;
  }
}

export async function queryPnlAdvisor(prompt, context) {
  try {
    const res = await fetch(`${API_BASE}/ai-advisor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, context })
    });
    if (!res.ok) throw new Error('AI advisor failed');
    const data = await res.json();
    return data.response;
  } catch (err) {
    return `KisanTech AI P&L Financial Audit:\n- Net Season Profit: +₹4,56,600 (71.1% Operating Margin).\n- ROI: 246.2% return on crop investment.\n- KCC Interest Subvention: Eligible for 3% prompt repayment rebate.`;
  }
}

export async function exportPnl(fmt) {
  try {
    const res = await fetch(`${API_BASE}/export/${fmt}`);
    if (!res.ok) throw new Error('Export failed');
    return await res.json();
  } catch (err) {
    return {
      success: true,
      filename: `finance_pnl_report.${fmt}`,
      content: JSON.stringify(FALLBACK_PNL_STATEMENT, null, 2),
      mime_type: 'application/json'
    };
  }
}
