import React from 'react';

import {
  Container,
  Skeleton,
} from '@mui/material';

import ENDPOINTS from '@api/endpoints';

import { useAdmin } from '@providers/AdminProvider';
import { useAuth } from '@providers/AuthProvider';

import { ReviewDialog } from '@utils/Dialogs';
import EnhancedTable from '@utils/Tables';

const Reports = () => {
  const { profile } = useAuth();

  const { reportOptions, reports, refetchReports } = useAdmin();

  if (!reportOptions || !reports) {
    return (
      <Container>
        <Skeleton variant="rounded" height={300} sx={{ borderRadius: 2 }} />
      </Container>
    );
  }

  const fields = [
    { id: 'id', label: 'ID', type: 'integer' },
    { id: 'sender', label: 'Sender', type: 'string' },
    { id: 'accused', label: 'Accused', type: 'string' },
    { id: 'reason', label: 'Reason', type: 'string' },
    { id: 'verdict', label: 'Verdict', type: 'choice' },
    { id: 'reviewed_by', label: 'Reviewed by', type: 'string' },
    { id: 'is_viewed', label: 'Viewed', type: 'boolean' },
    { id: 'created_at', label: 'Created at', type: 'datetime' },
  ];

  const data = reports.filter((report) => report.accused.id !== profile.id).map((report) => ({
    id: report.id,
    sender: report.sender.username,
    accused: report.accused.username,
    reason: reportOptions.actions.POST.reason.choices[report.reason].display_name,
    verdict: [
      report.verdict,
      reportOptions.actions.POST.verdict.choices[report.verdict].display_name,
    ],
    reviewed_by: report.reviewed_by?.username,
    is_viewed: report.is_viewed,
    created_at: report.created_at,
  }));

  return (
    <div className="Reports">
      <Container>
        <EnhancedTable
          title="Report"
          fields={fields}
          initialData={data}
          endpoint={ENDPOINTS.report}
          refetchData={refetchReports}
          Dialog={ReviewDialog}
          searchBy="accused"
          canEdit
        />
      </Container>
    </div>
  );
};

export default Reports;
