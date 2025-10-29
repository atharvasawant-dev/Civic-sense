import React from 'react';
import { useNavigate } from 'react-router-dom';
import IssueTable from '../components/IssueTable';
import Footer from '../components/Footer';

const Issues = () => {
  // Placeholder for all issues
  const issues = [];
  const navigate = useNavigate();
  return (
    <div className="page-container">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="font-bold text-2xl mb-2 text-blue-900">Reported Issues</h2>
          <button
            className="hero-btn report-issue-btn-ui"
            style={{ marginLeft: 'auto', fontWeight: 600, fontSize: '1rem' }}
            onClick={() => navigate('/report')}
          >
            Report an Issue
          </button>
        </div>
        <p className="mb-4 text-gray-700">Browse civic issues reported by citizens and track their status.</p>
        <IssueTable issues={issues} />
      </div>
      <Footer />
    </div>
  );
};

export default Issues;
