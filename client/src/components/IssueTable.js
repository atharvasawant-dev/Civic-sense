import React from 'react';

const IssueTable = ({ issues }) => (
  <div className="issue-cards flex flex-col gap-4">
    {issues.length === 0 ? (
      <div className="text-center text-gray-500">No issues reported yet.</div>
    ) : (
      issues.map((issue, idx) => (
        <div key={idx} className="bg-white rounded-lg shadow p-4 flex gap-4 items-center">
          {issue.image && (
            <img src={typeof issue.image === 'string' ? issue.image : URL.createObjectURL(issue.image)} alt="Issue" className="rounded w-24 h-16 object-cover" />
          )}
          <div className="flex-1">
            <div className="font-semibold text-lg mb-1">{issue.description.slice(0, 40)}{issue.description.length > 40 ? '...' : ''}</div>
            <div className="text-sm text-gray-600">Status: <span className={issue.status === 'Pending' ? 'text-yellow-600' : 'text-green-700'}>{issue.status}</span></div>
            <div className="text-xs text-gray-400">Date: {new Date(issue.date).toLocaleDateString()}</div>
          </div>
        </div>
      ))
    )}
  </div>
);

export default IssueTable;
