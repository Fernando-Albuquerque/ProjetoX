import { useState, useEffect } from 'react';
import { User, Users, MapPin, Compass, Clock } from 'lucide-react';
import './styles/index.css';
import { api } from './services/api';
import type { PlayerData, Pokemon } from './services/api';
import PlayerStats from './components/PlayerStats';
import PartyList from './components/PartyList';
import NearbyList from './components/NearbyList';
import TrackerArrow from './components/TrackerArrow';
import Timer from './components/Timer';

function App() {
  const [activeTab, setActiveTab] = useState<'player' | 'party' | 'nearby' | 'tracker' | 'timer'>('player');
  const [trackedPokemon, setTrackedPokemon] = useState<Pokemon | null>(null);

  const [error, setError] = useState<string | null>(null);

  // Data State
  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [party, setParty] = useState<Pokemon[]>([]);
  const [nearby, setNearby] = useState<Pokemon[]>([]);

  // Polling Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('[APP] Buscando dados do servidor...');
        const pData = await api.getPlayer();
        setPlayer(pData);

        const partyData = await api.getParty();
        setParty(partyData);

        const nearbyData = await api.getNearby();
        setNearby(nearbyData);
        setError(null);
        console.log('[APP] Dados recebidos com sucesso!');
      } catch (e) {
        console.error("[APP] Erro ao buscar dados:", e);
        setError(e instanceof Error ? e.message : "Falha ao conectar com o servidor");
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 100); // 100ms update rate (10fps)
    return () => clearInterval(interval);
  }, []);

  const handleTrack = (pokemon: Pokemon) => {
    setTrackedPokemon(pokemon);
    setActiveTab('tracker');
  };

  return (
    <div className="app-container">
      <header style={{ marginBottom: '20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>COBBLEMON <span style={{ color: 'white' }}>TRACKER</span></h1>
      </header>

      <main style={{ flex: 1, overflowY: 'auto', paddingBottom: '20px' }}>
        {activeTab === 'player' && (
          player ? <PlayerStats player={player} /> : (
            <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
              {error ? (
                <>
                  <p style={{ color: '#ff5555', marginBottom: '10px', fontSize: '1.2rem' }}>⚠️ Erro de Conexão</p>
                  <p style={{ fontSize: '0.9rem', color: 'white', marginBottom: '15px' }}>{error}</p>

                  <div style={{ textAlign: 'left', backgroundColor: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
                    <p style={{ fontWeight: 'bold', marginBottom: '8px', color: 'var(--primary)' }}>🔍 Diagnóstico:</p>
                    <ol style={{ fontSize: '0.8rem', color: 'var(--text-dim)', lineHeight: '1.6', paddingLeft: '20px' }}>
                      <li>Abra o Console do Navegador (pressione <code>F12</code>)</li>
                      <li>Veja se há mensagens de erro vermelhas</li>
                      <li>Teste se o mod está respondendo: <a href="http://localhost:4567/player" target="_blank" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Clique aqui</a></li>
                      <li>Se nada aparecer, verifique se o Minecraft está rodando com o mod</li>
                      <li>Se ainda não funcionar, reinicie o <code>npm run dev</code></li>
                    </ol>
                  </div>

                  <button
                    onClick={() => window.location.reload()}
                    style={{ padding: '10px 20px', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    🔄 Tentar Novamente
                  </button>
                </>
              ) : (
                <p className="animate-pulse-glow">⏳ Conectando ao servidor...</p>
              )}
            </div>
          )
        )}

        {activeTab === 'party' && (
          <PartyList party={party} />
        )}

        {activeTab === 'nearby' && (
          <NearbyList nearby={nearby} onTrack={handleTrack} />
        )}

        {activeTab === 'tracker' && (
          <div className="glass-panel" style={{ padding: '20px', height: '100%', boxSizing: 'border-box' }}>
            {trackedPokemon && player ? (
              <TrackerArrow player={player} target={trackedPokemon} />
            ) : (
              <div style={{ textAlign: 'center', marginTop: '50px', color: 'var(--text-dim)' }}>
                <p>Select a Pokémon from "Nearby" to track.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'timer' && (
          <Timer />
        )}
      </main>

      <nav className="nav-bar glass-panel">
        <button className={`nav-item ${activeTab === 'player' ? 'active' : ''}`} onClick={() => setActiveTab('player')}>
          <User />
          <span>Player</span>
        </button>
        <button className={`nav-item ${activeTab === 'party' ? 'active' : ''}`} onClick={() => setActiveTab('party')}>
          <Users />
          <span>Party</span>
        </button>
        <button className={`nav-item ${activeTab === 'nearby' ? 'active' : ''}`} onClick={() => setActiveTab('nearby')}>
          <MapPin />
          <span>Nearby</span>
        </button>
        <button className={`nav-item ${activeTab === 'tracker' ? 'active' : ''}`} onClick={() => setActiveTab('tracker')}>
          <Compass />
          <span>Tracker</span>
        </button>
        <button className={`nav-item ${activeTab === 'timer' ? 'active' : ''}`} onClick={() => setActiveTab('timer')}>
          <Clock />
          <span>Timer</span>
        </button>
      </nav>
    </div>
  );
}

export default App;
