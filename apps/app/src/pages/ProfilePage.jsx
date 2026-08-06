import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  getProfileSummary, 
  getPlanningAccuracy, 
  getProcrastinationFingerprint, 
  getNoteDensityCorrelation 
} from '../api/profileApi';

import OverviewTab from './profile/OverviewTab';
import PlanningAccuracyTab from './profile/PlanningAccuracyTab';
import InsightsTab from './profile/InsightsTab';
import RetrospectiveTab from './profile/RetrospectiveTab';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('overview');
  
  // Data states
  const [summaryData, setSummaryData] = useState(null);
  const [planningData, setPlanningData] = useState(null);
  const [procrastinationData, setProcrastinationData] = useState(null);
  const [noteDensityData, setNoteDensityData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        if (activeTab === 'overview' && !summaryData) {
          const data = await getProfileSummary();
          setSummaryData(data);
        } else if (activeTab === 'planning' && !planningData) {
          const data = await getPlanningAccuracy();
          setPlanningData(data);
        } else if (activeTab === 'insights' && (!procrastinationData || !noteDensityData)) {
          const [proc, noteD] = await Promise.all([
            getProcrastinationFingerprint(),
            getNoteDensityCorrelation()
          ]);
          setProcrastinationData(proc);
          setNoteDensityData(noteD);
        }
      } catch (err) {
        console.error('Failed to load profile data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [activeTab]);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'planning', label: 'Planning & Accuracy' },
    { id: 'insights', label: 'Note Density & Insights' },
    { id: 'retrospective', label: 'Retrospective Generator' }
  ];

  return (
    <div className="page active" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div className="no-print" style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' 
      }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>Insights & Profile</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            Analyze your study patterns and generate actionable retrospectives.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            padding: '0.5rem 1rem', background: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
            fontSize: '13px', color: 'var(--text-secondary)'
          }}>
            <strong style={{ color: 'var(--text-primary)' }}>{user?.email}</strong>
          </div>
          <button className="secondary-btn" onClick={() => navigate('/')}>Dashboard</button>
        </div>
      </div>

      <div className="no-print" style={{ 
        display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', overflowX: 'auto'
      }}>
        {tabs.map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.5rem 1rem',
              background: activeTab === tab.id ? 'var(--blue)' : 'transparent',
              color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ minHeight: '400px' }}>
        {loading && activeTab !== 'retrospective' ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
            Loading {tabs.find(t => t.id === activeTab).label}...
          </div>
        ) : (
          <>
            {activeTab === 'overview' && <OverviewTab summary={summaryData} />}
            {activeTab === 'planning' && <PlanningAccuracyTab data={planningData} />}
            {activeTab === 'insights' && <InsightsTab procrastination={procrastinationData} noteDensity={noteDensityData} />}
            {activeTab === 'retrospective' && <RetrospectiveTab />}
          </>
        )}
      </div>
    </div>
  );
}
