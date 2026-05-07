import React, { useState } from 'react';
import { RotaPage } from './RotaPage';
import { useClientList } from '../../hooks/api/useClientsApi';

interface ClientCompany {
  id: string;
  name: string;
  location?: string;
}

export default function RotaBuilderPage() {
  const { data: clientsData, isLoading: clientsLoading } = useClientList({ status: 'ACTIVE' });
  const clients = clientsData?.clients ?? [];
  
  // Map API client data to ClientCompany interface
  const clientCompanies: ClientCompany[] = clients.map((client) => ({
    id: client.id,
    name: client.name,
    location: client.contactEmail ? client.contactEmail.split('@')[1] : undefined, // Use email domain as location fallback
  }));

  const [activeClientId, setActiveClientId] = useState<string>('');
  const effectiveClientId = activeClientId || clientCompanies[0]?.id || '';
  const [showAddClient, setShowAddClient] = useState(false);
  const activeClient = clientCompanies.find((c) => c.id === effectiveClientId);

  if (clientsLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'inherit' }}>
        <div style={{ color: '#888' }}>Loading clients...</div>
      </div>
    );
  }

  if (clientCompanies.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 16, fontFamily: 'inherit' }}>
        <div style={{ color: '#888' }}>No clients found</div>
        <button
          onClick={() => setShowAddClient(true)}
          style={{ padding: '8px 16px', borderRadius: 8, border: '0.5px solid #ddd', background: '#fff', cursor: 'pointer', fontSize: 12 }}
        >
          Add first client
        </button>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'inherit' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderBottom: '0.5px solid #eee', background: '#fafafa', flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 600, fontSize: 15, marginRight: 4 }}>Rota Builder</span>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', flex: 1 }}>
          {clientCompanies.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveClientId(c.id)}
              style={{ padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: '0.5px solid', borderColor: effectiveClientId === c.id ? '#333' : '#ddd', background: effectiveClientId === c.id ? '#333' : 'transparent', color: effectiveClientId === c.id ? '#fff' : '#555', transition: 'all .15s' }}
            >
              {c.name}
            </button>
          ))}
          <button onClick={() => setShowAddClient(true)} style={{ padding: '5px 12px', borderRadius: 20, fontSize: 12, border: '0.5px dashed #ccc', background: 'transparent', color: '#999', cursor: 'pointer' }}>
            + Add client
          </button>
        </div>
        {activeClient?.location && (
          <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: '#E6F1FB', color: '#0C447C', fontWeight: 500 }}>
            📍 {activeClient.location}
          </span>
        )}
      </div>
      <RotaPage key={effectiveClientId} clientCompanyId={effectiveClientId} clientName={activeClient?.name} />
      {showAddClient && (
        <div onClick={() => setShowAddClient(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 10, padding: 20, width: 280, border: '0.5px solid #ddd' }}>
            <h3 style={{ fontSize: 14, fontWeight: 500, marginBottom: 14 }}>Add client</h3>
            <input type="text" placeholder="Client name" style={{ width: '100%', padding: '7px 10px', border: '0.5px solid #ddd', borderRadius: 6, fontSize: 12, marginBottom: 8 }} />
            <input type="text" placeholder="Location (optional)" style={{ width: '100%', padding: '7px 10px', border: '0.5px solid #ddd', borderRadius: 6, fontSize: 12, marginBottom: 14 }} />
            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowAddClient(false)} style={{ padding: '6px 14px', borderRadius: 6, border: '0.5px solid #ddd', background: '#fff', cursor: 'pointer', fontSize: 12 }}>Cancel</button>
              <button onClick={() => setShowAddClient(false)} style={{ padding: '6px 14px', borderRadius: 6, border: 'none', background: '#22a06b', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 500 }}>Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
