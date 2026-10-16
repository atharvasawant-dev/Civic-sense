// client/src/components/CategoryPlaceholder.js
import React from 'react';

const categoryColors = {
  Pothole: { bg: '#fff0e6', border: '#ffbb96', text: '#d4380d', icon: '🕳️' },
  Garbage: { bg: '#f6ffed', border: '#b7eb8f', text: '#389e0d', icon: '🗑️' },
  Streetlight: { bg: '#feffe6', border: '#fffb8f', text: '#d4b106', icon: '💡' },
  'Water Supply': { bg: '#e6f7ff', border: '#91d5ff', text: '#096dd9', icon: '🚰' },
  Drainage: { bg: '#f9f0ff', border: '#d3adf7', text: '#722ed1', icon: '🌊' },
  Other: { bg: '#f5f5f5', border: '#d9d9d9', text: '#595959', icon: '📢' },
};

export const getCategoryMeta = (category) => {
  return categoryColors[category] || categoryColors.Other;
};

export const CategoryPlaceholder = ({ category, height = 220 }) => {
  const meta = getCategoryMeta(category);
  return (
    <div
      style={{
        width: '100%',
        height: `${height}px`,
        backgroundColor: meta.bg,
        border: `1px solid ${meta.border}`,
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: meta.text,
        userSelect: 'none',
      }}
    >
      <span style={{ fontSize: '48px', marginBottom: '8px' }}>{meta.icon}</span>
      <span style={{ fontSize: '15px', fontWeight: '600' }}>
        {category || 'Civic Grievance'}
      </span>
      <span style={{ fontSize: '12px', opacity: 0.75, marginTop: '4px' }}>
        Verified Civic Record
      </span>
    </div>
  );
};

export default CategoryPlaceholder;
