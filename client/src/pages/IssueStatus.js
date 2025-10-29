import React, { useState, useEffect } from 'react';
import Footer from '../components/Footer';

const API_URL = 'http://localhost:5000/api/issues';

const statusColors = {
  'Submitted': '#ffe066',
  'In Progress': '#ffe066',
  'Resolved': '#b2f2bb',
};

const statusLabels = {
  'Pending': 'Submitted',
  'In Progress': 'In Progress',
  'Resolved': 'Resolved',
};

const IssueStatus = () => {
  const [issues, setIssues] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => setIssues(data))
      .catch(() => setIssues([]));
  }, []);

  const filteredIssues = issues.filter(issue =>
    issue.title?.toLowerCase().includes(search.toLowerCase()) ||
    issue.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-container">
      <div className="card">
        <h2 className="font-bold text-2xl mb-4 text-blue-900">Issue Status</h2>
        <input
          type="text"
          placeholder="Search issues..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-ui mb-4"
        />
        <div className="issue-status-list-ui">
          {filteredIssues.length === 0 ? (
            <div className="text-center text-gray-500">No issues found.</div>
          ) : (
            filteredIssues.map((issue, idx) => (
              <div key={idx} className="issue-status-card-ui">
                <div className="issue-title-ui">{issue.title || issue.description?.split(':')[0]}</div>
                <div className="issue-desc-ui">{issue.description}</div>
                <div className="issue-date-ui">Reported: {new Date(issue.date).toLocaleDateString()}</div>
                <span
                  className="issue-status-badge-ui"
                  style={{ background: statusColors[statusLabels[issue.status] || 'Submitted'] }}
                >
                  {statusLabels[issue.status] || 'Submitted'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default IssueStatus;
