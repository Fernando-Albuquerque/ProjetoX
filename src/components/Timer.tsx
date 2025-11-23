import { useEffect, useState, useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

const Timer = () => {
    const [timerSeconds, setTimerSeconds] = useState(60 * 60); // 60 minutes in seconds
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const timerIntervalRef = useRef<number | null>(null);

    // Request notification permission on mount
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    // Timer logic
    useEffect(() => {
        if (isTimerRunning) {
            timerIntervalRef.current = window.setInterval(() => {
                setTimerSeconds(prev => {
                    if (prev <= 1) {
                        // Timer finished - play beep 3x, show notification, and restart
                        playBeep();
                        showNotification();
                        setIsTimerRunning(false);
                        return 60 * 60; // Reset to 60 minutes
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
            }
        }

        return () => {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
            }
        };
    }, [isTimerRunning]);

    // Play beep sound 3 times
    const playBeep = () => {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

        const beep = (index: number) => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800; // Frequency in Hz
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);

            if (index < 2) {
                setTimeout(() => beep(index + 1), 400);
            }
        };

        beep(0);
    };

    // Show browser notification
    const showNotification = () => {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('⏰ Timer Concluído!', {
                body: 'O timer de 60 minutos foi finalizado!',
                icon: '/favicon.ico',
                tag: 'timer-finished'
            });
        }
    };

    const toggleTimer = () => {
        setIsTimerRunning(!isTimerRunning);
    };

    const resetTimer = () => {
        setTimerSeconds(60 * 60);
        setIsTimerRunning(false);
    };

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="glass-panel" style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
            <h2 style={{ marginBottom: '30px', fontSize: '1.5rem' }}>Timer de Respawn</h2>

            {/* Timer Display */}
            <div style={{
                fontSize: '5rem',
                fontWeight: 'bold',
                color: timerSeconds <= 300 ? '#ff5555' : 'var(--primary)',
                fontFamily: 'monospace',
                letterSpacing: '5px',
                marginBottom: '40px',
                textShadow: `0 0 20px ${timerSeconds <= 300 ? '#ff5555' : 'var(--primary)'}`,
                transition: 'color 0.3s, text-shadow 0.3s'
            }}>
                {formatTime(timerSeconds)}
            </div>

            {/* Status Text */}
            <div style={{
                fontSize: '1rem',
                color: 'var(--text-dim)',
                marginBottom: '30px',
                fontWeight: 'bold'
            }}>
                {isTimerRunning ? '⏱️ Em execução...' : '⏸️ Pausado'}
            </div>

            {/* Control Buttons */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                <button
                    onClick={toggleTimer}
                    style={{
                        background: isTimerRunning ? 'rgba(255, 85, 85, 0.2)' : 'rgba(0, 255, 157, 0.2)',
                        border: `3px solid ${isTimerRunning ? '#ff5555' : 'var(--primary)'}`,
                        color: isTimerRunning ? '#ff5555' : 'var(--primary)',
                        borderRadius: '50%',
                        width: '80px',
                        height: '80px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                        fontWeight: 'bold',
                        boxShadow: `0 0 20px ${isTimerRunning ? 'rgba(255, 85, 85, 0.3)' : 'rgba(0, 255, 157, 0.3)'}`
                    }}
                    title={isTimerRunning ? 'Pausar' : 'Iniciar'}
                >
                    {isTimerRunning ? <Pause size={36} /> : <Play size={36} />}
                </button>

                <button
                    onClick={resetTimer}
                    style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '3px solid rgba(255, 255, 255, 0.3)',
                        color: 'white',
                        borderRadius: '50%',
                        width: '80px',
                        height: '80px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                        fontWeight: 'bold',
                        boxShadow: '0 0 20px rgba(255, 255, 255, 0.2)'
                    }}
                    title="Resetar para 60 minutos"
                >
                    <RotateCcw size={36} />
                </button>
            </div>

            {/* Info Text */}
            <div style={{
                textAlign: 'center',
                color: 'var(--text-dim)',
                fontSize: '0.85rem',
                maxWidth: '350px',
                lineHeight: '1.6',
                marginTop: '20px',
                background: 'rgba(0,0,0,0.3)',
                padding: '15px',
                borderRadius: '8px'
            }}>
                <p style={{ marginBottom: '8px' }}>🔔 Quando o timer chegar a zero:</p>
                <ul style={{ textAlign: 'left', paddingLeft: '20px', margin: '0' }}>
                    <li>Emite 3 bips sonoros</li>
                    <li>Envia uma notificação</li>
                    <li>Reseta automaticamente para 60 min</li>
                </ul>
            </div>
        </div>
    );
};

export default Timer;
