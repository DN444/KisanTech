import React, { useState } from 'react';
import { 
  Landmark, FileText, CheckCircle, ShieldAlert, Calculator, Lock, ShieldCheck, Eye
} from 'lucide-react';
import { AIBadgePanel } from '../ui/AIBadgePanel';
import GovernmentSchemesTab from './GovernmentSchemesTab';
import SubsidiesTrackerTab from './SubsidiesTrackerTab';
import CropInsuranceTab from './CropInsuranceTab';
import LoanAssistantTab from './LoanAssistantTab';
import DocumentCenterTab from './DocumentCenterTab';

export const GovtTabs = ({ subTab }) => {
  switch (subTab) {
    case 'document-center':
      return <DocumentCenterTab />;

    case 'loan-assistant':
      return <LoanAssistantTab />;

    case 'crop-insurance':
      return <CropInsuranceTab />;

    case 'subsidies':
      return <SubsidiesTrackerTab />;

    case 'govt-schemes':
    default:
      return <GovernmentSchemesTab />;
  }
};
