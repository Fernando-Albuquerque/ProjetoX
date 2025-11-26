import { useState, useEffect, useRef } from 'react';
import { User, Users, MapPin, ArrowDownRight, Minimize2, Maximize2, RefreshCw, Sword, Database, Bot } from 'lucide-react';
import './styles/index.css';
import { api } from './services/api';
import type { PlayerData, Pokemon, BattleData } from './types';
import PlayerStats from './components/PlayerStats';
import PartyList from './components/PartyList';
import NearbyList from './components/NearbyList';
import BattleView from './components/BattleView';
import PCList from './components/PCList';
import AIChat from './components/AIChat';

function App() {
  const [activeTab, setActiveTab] = useState<'player' | 'party' | 'nearby' | 'battle' | 'pc' | 'ai'>('player');
  const [error, setError] = useState<string | null>(null);

  // Data State
  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [party, setParty] = useState<Pokemon[]>([]);
  const [nearby, setNearby] = useState<Pokemon[]>([]);
  const [battle, setBattle] = useState<BattleData | null>(null);
  const [pc, setPc] = useState<Pokemon[]>([]);

  // Settings State
  const [geminiKey, setGeminiKey] = useState<string>(() => {
    return localStorage.getItem('gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY || '';
  });

  // Save API Key
  useEffect(() => {
    if (geminiKey) {
      localStorage.setItem('gemini_api_key', geminiKey);
    }
  }, [geminiKey]);

  // Window State
  const [opacity, setOpacity] = useState(1.0);
  const [isAdjustingOpacity, setIsAdjustingOpacity] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [savedDimensions, setSavedDimensions] = useState({ width: window.outerWidth, height: window.outerHeight });

  const toggleMinimize = () => {
    if (!isMinimized) {
      // Minimizing: Save current size and shrink
      setSavedDimensions({ width: window.outerWidth, height: window.outerHeight });
      window.resizeTo(450, 80); // Shrink to header size
      setIsMinimized(true);
    } else {
      // Maximizing: Restore saved size
      window.resizeTo(savedDimensions.width, savedDimensions.height);
      setIsMinimized(false);
    }
  };

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
        // console.log(`[WATCHDOG] Tempo desde última atualização: ${timeSinceLastUpdate}ms`);

        if (timeSinceLastUpdate > 10000) { // Increased to 10s to avoid false positives during heavy loads
          console.log("[WATCHDOG] ⚠️ TRAVOU! Recarregando...");
          window.location.reload();
        }
      }, 2000);

      // Store interval ID globally so it never gets cleared
      (window as any).__watchdogInterval = watchdogInterval;
    }

    // DON'T return cleanup function - we want this to run forever
  }, []);

  // Polling Data
  useEffect(() => {
    let isMounted = true;
    let timeoutId: ReturnType<typeof setTimeout>;
    let pcFetchCounter = 0;

    const fetchData = async () => {
      try {
        // console.log("[FETCH] Buscando dados...");
        const pData = await api.getPlayer();
        if (isMounted) {
          setPlayer(pData);
          // Update GLOBAL timestamp on success
          (window as any).__lastUpdateTime = Date.now();
          lastUpdateTime.current = Date.now();
          // console.log("[FETCH] ✓ Dados recebidos, timestamp atualizado");

          // Fetch other data only if player fetch succeeds
          const partyData = await api.getParty();
          setParty(partyData);

          const nearbyData = await api.getNearby();
          setNearby(nearbyData);

          const battleData = await api.getBattle();
          setBattle(battleData);

          // Fetch PC data less frequently (every 10 cycles ~ 10 seconds)
          pcFetchCounter++;
          if (pcFetchCounter >= 10) {
            const pcData = await api.getPC();
            setPc(pcData);
            pcFetchCounter = 0;
          }

          setError(null);
          setIsReconnecting(false);

          // Success: fetch again quickly (1000ms - reduced from 100ms to avoid spamming)
          timeoutId = setTimeout(fetchData, 1000);
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
      <div className="app-container" style={{
        width: isMinimized ? 'fit-content' : '100%', // Shrink to fit content when minimized
        height: isMinimized ? 'auto' : '100vh',
        position: 'relative',
        backgroundColor: `rgba(10, 10, 15, ${isMinimized ? 0 : opacity})`,
        transition: isAdjustingOpacity ? 'none' : 'background-color 0.2s',
        overflow: 'hidden',
        pointerEvents: 'none',
        margin: isMinimized ? '0 auto' : '0' // Center when minimized
      }}>

        {/* Reconnecting Indicator */}
        {isReconnecting && player && !isMinimized && (
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
            pointerEvents: 'auto', // Enable clicks on indicator
            animation: 'pulse 2s infinite',
            boxShadow: '0 2px 8px rgba(255, 165, 0, 0.4)'
          }}>
            ⚠️ Conexão perdida - Tentando reconectar...
          </div>
        )}

        {/* Invisible Opacity Slider - Only when not minimized */}
        {!isMinimized && (
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
              background: 'transparent', // Invisible
              pointerEvents: 'auto' // Enable clicks on slider
            }}
          />
        )}

        {/* Resize Handle - Only when not minimized */}
        {!isMinimized && (
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
              padding: '5px',
              pointerEvents: 'auto' // Enable clicks on resize handle
            }}
            className="resize-handle-icon"
          >
            <ArrowDownRight size={24} />
          </div>
        )}

        <header style={{
          marginBottom: isMinimized ? '0' : '20px',
          textAlign: 'center',
          // position: 'relative', // No longer needed for absolute children
          padding: '10px 20px',
          background: isMinimized ? 'rgba(10, 10, 15, 0.8)' : 'transparent',
          borderRadius: isMinimized ? '0 0 10px 10px' : '0',
          transition: 'all 0.3s ease',
          pointerEvents: 'auto',
          width: isMinimized ? 'fit-content' : '100%', // Full width when normal, fit when minimized
          margin: '0 auto',
          // @ts-ignore
          WebkitAppRegion: 'drag',
          userSelect: 'none',
          display: 'flex', // Use Flexbox
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px' // Space between title and buttons
        }}>
          <h1 style={{ fontSize: '1.5rem', color: 'var(--primary)', margin: 0 }}>COBBLEMON <span style={{ color: 'white' }}>TRACKER</span></h1>

          <div style={{
            // position: 'absolute', // Removed absolute positioning
            // top: '50%',
            // right: '-70px',
            // transform: 'translateY(-50%)',
            display: 'flex',
            gap: '5px',
            // @ts-ignore
            WebkitAppRegion: 'no-drag'
          }}>
            {/* Minimize/Maximize Button */}
            <button
              onClick={toggleMinimize}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '6px',
                padding: '6px',
                cursor: 'pointer',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
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
              title={isMinimized ? "Maximizar" : "Minimizar"}
            >
              {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
            </button>

            {/* Manual Refresh Button */}
            <button
              onClick={() => window.location.reload()}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '6px',
                padding: '6px',
                cursor: 'pointer',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
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
              <RefreshCw size={16} />
            </button>
          </div>
        </header>

        {!isMinimized && (
          <>
            <main style={{ flex: 1, overflowY: 'auto', paddingBottom: '20px', pointerEvents: 'auto' }}>
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

              {activeTab === 'battle' && (
                <BattleView battle={battle} />
              )}

              {activeTab === 'pc' && (
                <PCList pc={pc} />
              )}

              {activeTab === 'ai' && (
                <AIChat
                  context={{ player, party, battle, nearby, pc }}
                  apiKey={geminiKey}
                  setApiKey={setGeminiKey}
                />
              )}
            </main>

            <nav className="nav-bar glass-panel" style={{ pointerEvents: 'auto' }}>
              <button className={`nav-item ${activeTab === 'player' ? 'active' : ''}`} onClick={() => setActiveTab('player')} title="Player">
                <User size={20} />
              </button>
              <button className={`nav-item ${activeTab === 'party' ? 'active' : ''}`} onClick={() => setActiveTab('party')} title="Party">
                <Users size={20} />
              </button>
              <button className={`nav-item ${activeTab === 'nearby' ? 'active' : ''}`} onClick={() => setActiveTab('nearby')} title="Nearby">
                <MapPin size={20} />
              </button>
              <button className={`nav-item ${activeTab === 'battle' ? 'active' : ''}`} onClick={() => setActiveTab('battle')} title="Battle">
                <Sword size={20} />
              </button>
              <button className={`nav-item ${activeTab === 'pc' ? 'active' : ''}`} onClick={() => setActiveTab('pc')} title="PC">
                <Database size={20} />
              </button>
              <button className={`nav-item ${activeTab === 'ai' ? 'active' : ''}`} onClick={() => setActiveTab('ai')} title="AI Assistant">
                <Bot size={20} />
              </button>
            </nav>
          </>
        )}
      </div>
    </>
  );
}

export default App;
