import type { PlayerData } from '../types';
import { Heart, Compass, Map } from 'lucide-react';

interface PlayerStatsProps {
    player: PlayerData;
}

const PlayerStats = ({ player }: PlayerStatsProps) => {
    return (
        <div className="glass-panel" style={{ padding: '20px' }}>
            <h2 style={{ marginBottom: '20px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>
                {player.name}
            </h2>

            <div style={{ display: 'grid', gap: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Heart className="text-accent" />
                    <div>
                        <div className="text-dim" style={{ fontSize: '0.8rem' }}>HEALTH</div>
                        <div style={{ fontSize: '1.2rem' }}>{player.health.toFixed(1)} / {player.max_health.toFixed(1)}</div>
                        <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', marginTop: '5px', borderRadius: '2px' }}>
                            <div style={{
                                width: `${(player.health / player.max_health) * 100}%`,
                                height: '100%',
                                background: 'var(--accent)',
                                borderRadius: '2px'
                            }} />
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Map className="text-primary" />
                    <div>
                        <div className="text-dim" style={{ fontSize: '0.8rem' }}>POSITION</div>
                        <div style={{ fontSize: '1.1rem' }}>
                            X: {player.x.toFixed(1)} <br />
                            Y: {player.y.toFixed(1)} <br />
                            Z: {player.z.toFixed(1)}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Compass className="text-primary" />
                    <div>
                        <div className="text-dim" style={{ fontSize: '0.8rem' }}>ORIENTATION</div>
                        <div>Yaw: {player.yaw.toFixed(1)}°</div>
                        <div>Pitch: {player.pitch.toFixed(1)}°</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlayerStats;
