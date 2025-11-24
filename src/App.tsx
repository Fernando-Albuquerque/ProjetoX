import { useState, useEffect, useRef } from 'react';
import { User, Users, MapPin, ArrowDownRight } from 'lucide-react';
import './styles/index.css';
import { api } from './services/api';
import type { PlayerData, Pokemon } from './services/api';
import PlayerStats from './components/PlayerStats';
import PartyList from './components/PartyList';
import NearbyList from './components/NearbyList';
import WindowControls from './components/WindowControls';

function App() {
  const [activeTab, setActiveTab] = useState<'player' | 'party' | 'nearby'>('player');
  const [error, setError] = useState<string | null>(null);

  // Data State
  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [party, setParty] = useState<Pokemon[]>([]);
  const [nearby, setNearby] = useState<Pokemon[]>([]);

  // Window State
  const [opacity, setOpacity] = useState(1.0);
  const [isAdjustingOpacity, setIsAdjustingOpacity] = useState(false);

  // Resize Logic (Pointer Events)
  const handleResizeDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleResizeMove = (e: React.PointerEvent) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      window.resizeBy(e.movementX, e.movementY);
    }
  };

  const handleResizeUp = (e: React.PointerEvent) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  // Opacity Logic (Pointer Events)
  const handleOpacityDown = (e: React.PointerEvent) => {
    setIsAdjustingOpacity(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleOpacityMove = (e: React.PointerEvent) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      const ratio = e.clientX / window.innerWidth;
      const newOpacity = Math.max(0.2, Math.min(1.0, ratio));
      setOpacity(newOpacity);
    }
  };

  const handleOpacityUp = (e: React.PointerEvent) => {
    setIsAdjustingOpacity(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  // Connection State
  const [isReconnecting, setIsReconnecting] = useState(false);
  const lastUpdateTime = useRef(Date.now());

  // GLOBAL WATCHDOG - Runs independently of React lifecycle
  useEffect(() => {
    // Only start watchdog once globally
    if (!(window as any).__watchdogStarted) {
      (window as any).__watchdogStarted = true;
      (window as any).__lastUpdateTime = Date.now();

      console.log("[WATCHDOG] Iniciado GLOBALMENTE - nunca será desligado");

      const watchdogInterval = setInterval(() => {
        const timeSinceLastUpdate = Date.now() - (window as any).__lastUpdateTime;
        console.log(`[WATCHDOG] Tempo desde última atualização: ${timeSinceLastUpdate}ms`);

        if (timeSinceLastUpdate > 5000) {
          console.log("[WATCHDOG] ⚠️ TRAVOU! Recarregando...");
          window.location.reload();
        }
      }, 1000); // Check every 1 second

      // Store interval ID globally so it never gets cleared
      (window as any).__watchdogInterval = watchdogInterval;
    }

    // DON'T return cleanup function - we want this to run forever
  }, []);

  // Polling Data
  useEffect(() => {
    let isMounted = true;
    let timeoutId: ReturnType<typeof setTimeout>;

    const fetchData = async () => {
      try {
        console.log("[FETCH] Buscando dados...");
        const pData = await api.getPlayer();
        if (isMounted) {
          setPlayer(pData);
          // Update GLOBAL timestamp on success
          (window as any).__lastUpdateTime = Date.now();
          lastUpdateTime.current = Date.now();
          console.log("[FETCH] ✓ Dados recebidos, timestamp atualizado");

          // Fetch other data only if player fetch succeeds
          const partyData = await api.getParty();
          setParty(partyData);

          const nearbyData = await api.getNearby();
          setNearby(nearbyData);

          setError(null);
          setIsReconnecting(false);

          // Success: fetch again quickly (100ms)
          timeoutId = setTimeout(fetchData, 100);
        }
      } catch (e) {
        if (isMounted) {
          console.error("[FETCH] ✗ Erro:", e);

          // Do NOT clear player state on error to prevent UI flashing
          // Only set error if we have NO data at all
          if (!player) {
            setError(e instanceof Error ? e.message : "Falha ao conectar com o servidor");
          } else {
            // We have data, but connection lost. Show reconnecting state.
            setIsReconnecting(true);
          }

          // Error: wait 1 second before retrying
          timeoutId = setTimeout(fetchData, 1000);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, []); // Empty dependency array means this runs once on mount, then loops via setTimeout

  return (
    <>
      <WindowControls />
      <div className="app-container" style={{
        width: '100%',
        height: '100vh',
        position: 'relative',
        backgroundColor: `rgba(10, 10, 15, ${opacity})`, // Opacity affects background only
        transition: isAdjustingOpacity ? 'none' : 'background-color 0.2s'
      }}>

        {/* Reconnecting Indicator */}
        {isReconnecting && player && (
          <div style={{
            position: 'absolute',
            top: '40px',
            right: '20px',
            background: 'rgba(255, 165, 0, 0.9)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            zIndex: 100,
            pointerEvents: 'none',
            animation: 'pulse 2s infinite',
            boxShadow: '0 2px 8px rgba(255, 165, 0, 0.4)'
          }}>
            ⚠️ Conexão perdida - Tentando reconectar...
          </div>
        )}

        {/* Invisible Opacity Slider */}
        <div
          className="opacity-slider"
          onPointerDown={handleOpacityDown}
          onPointerMove={handleOpacityMove}
          onPointerUp={handleOpacityUp}
          title="Drag left/right to change opacity"
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            width: 'calc(100% - 40px)', // Leave space for resize handle
            height: '15px',
            cursor: 'ew-resize',
            zIndex: 9999,
            background: 'transparent' // Invisible
          }}
        />

        {/* Resize Handle */}
        <div
          onPointerDown={handleResizeDown}
          onPointerMove={handleResizeMove}
          onPointerUp={handleResizeUp}
          style={{
            position: 'fixed',
            bottom: '5px',
            right: '5px',
            cursor: 'se-resize',
            zIndex: 10000,
            color: 'rgba(255, 255, 255, 0.5)',
            transition: 'color 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '5px'
          }}
          className="resize-handle-icon"
        >
          <ArrowDownRight size={24} />
        </div>
        <header style={{ marginBottom: '20px', textAlign: 'center', position: 'relative' }}>
          <h1 style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>COBBLEMON <span style={{ color: 'white' }}>TRACKER</span></h1>
          {/* Manual Refresh Button */}
          <button
            onClick={() => window.location.reload()}
            style={{
              position: 'absolute',
              top: '0',
              right: '10px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '6px',
              padding: '6px 10px',
              cursor: 'pointer',
              color: 'white',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
            title="Recarregar overlay (F5)"
          >
            🔄 Refresh
          </button>
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
            <NearbyList nearby={nearby} player={player} />
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
        </nav>
      </div>
    </>
  );
}

export default App;
