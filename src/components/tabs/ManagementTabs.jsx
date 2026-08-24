import React from 'react';
import { Boxes, Receipt, DollarSign, UserCheck, Calendar, Kanban } from 'lucide-react';
import { AIBadgePanel } from '../ui/AIBadgePanel';
import WarehouseStorageTab from './WarehouseStorageTab';
import FarmExpensesTab from './FarmExpensesTab';
import FarmFinancePnlTab from './FarmFinancePnlTab';
import FarmEmployeesTab from './FarmEmployeesTab';
import FarmCalendarTab from './FarmCalendarTab';
import FarmTaskPlannerTab from './FarmTaskPlannerTab';

export const ManagementTabs = ({ subTab }) => {
  switch (subTab) {
    case 'inventory':
      return (
        <div className="space-y-4 animate-in fade-in">
          <AIBadgePanel tabId="inventory" tabName="Smart Supply Inventory & Stock Alert AI" defaultPrompt="Predict Urea fertilizer stockout date and generate auto-reorder order." />
          <WarehouseStorageTab />
        </div>
      );

    case 'expenses':
      return (
        <div className="space-y-4 animate-in fade-in">
          <AIBadgePanel tabId="expenses" tabName="Interactive Expense Audit AI" defaultPrompt="Break down seasonal expenditure slices (Seeds 25%, Fertilizer 35%, Labor 28%, Diesel 12%)." />
          <FarmExpensesTab />
        </div>
      );

    case 'finance':
      return (
        <div className="space-y-4 animate-in fade-in">
          <AIBadgePanel tabId="finance" tabName="P&L Net Profit Margin AI Engine" defaultPrompt="Audit Net Season Profit (Revenue ₹6,42,000 - Expenses ₹1,85,400 = Net ₹4,56,600)." />
          <FarmFinancePnlTab />
        </div>
      );

    case 'employees':
      return (
        <div className="space-y-4 animate-in fade-in">
          <AIBadgePanel tabId="employees" tabName="Labor Roster & Payroll AI" defaultPrompt="Calculate daily labor productivity metrics and attendance payroll." />
          <FarmEmployeesTab />
        </div>
      );

    case 'calendar':
      return (
        <div className="space-y-4 animate-in fade-in">
          <AIBadgePanel tabId="calendar" tabName="Monthly Activity Schedule AI" defaultPrompt="Schedule optimal dates for spraying and basal sowing." />
          <FarmCalendarTab />
        </div>
      );

    case 'task-planner':
    default:
      return (
        <div className="space-y-4 animate-in fade-in">
          <AIBadgePanel tabId="task-planner" tabName="Kanban Swarm Task Planner AI" defaultPrompt="Prioritize field tasks: Propiconazole spraying (High), Irrigation (In Progress)." />
          <FarmTaskPlannerTab />
        </div>
      );
  }
};
