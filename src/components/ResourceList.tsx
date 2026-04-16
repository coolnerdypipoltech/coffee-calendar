import React, { useEffect, useState } from 'react';
import { Resource } from '../lib/types';
import { fetchResources } from '../lib/api';

interface Props {
  selected: Resource | null;
  onSelect: (r: Resource) => void;
}

export default function ResourceList({ selected, onSelect }: Props) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchResources()
      .then(setResources)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="sidebar-loading">Loading resources…</div>;
  if (error) return <div className="error-msg">{error}</div>;

  return (
    <div className="resource-list">
      <h2>Resources</h2>
      {resources.map((r) => (
        <div
          key={r.id}
          className={`resource-card ${selected?.id === r.id ? 'active' : ''}`}
          onClick={() => onSelect(r)}
        >
          <h3>{r.name}</h3>
          <p className="resource-desc">{r.description}</p>
          <div className="resource-meta">
            <span>👥 {r.capacity}</span>
            <span>${r.price_per_hour}/hr</span>
          </div>
        </div>
      ))}
    </div>
  );
}
