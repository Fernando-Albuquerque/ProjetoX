import { useEffect, useState } from 'react';
import type { PlayerData, Pokemon } from '../services/api';
import { Navigation } from 'lucide-react';

interface TrackerArrowProps {
    player: PlayerData;
    target: Pokemon;
}

const TrackerArrow = ({ player, target }: TrackerArrowProps) => {
    const [angle, setAngle] = useState(0);

    useEffect(() => {
        if (!target.x || !target.z) return;

        const dx = target.x - player.x;
        const dz = target.z - player.z;

        // Calculate angle in degrees
        // Math.atan2(y, x) -> here we use (z, x) because Z is the "Y" axis on the map plane
        const targetAngle = Math.atan2(dz, dx) * (180 / Math.PI);

        // Minecraft Yaw: 0=South, 90=West, 180=North, 270=East (or -90=East)
        // Formula derived: targetAngle - 90 - playerYaw
        let relativeAngle = targetAngle - 90 - player.yaw;

        setAngle(relativeAngle);
    }, [player, target]);

    const distance = Math.sqrt(
        Math.pow((target.x || 0) - player.x, 2) +
        Math.pow((target.z || 0) - player.z, 2)
    ).toFixed(1);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <h2 className="text-accent" style={{ marginBottom: '10px' }}>Tracking {target.species}</h2>

            <div style={{
                position: 'relative',
                width: '250px',
                height: '250px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px'
            }}>
                {/* Outer Ring */}
                <div style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    border: '2px solid var(--primary-dim)',
                    boxShadow: '0 0 20px var(--primary-dim) inset'
                }} />

                {/* Arrow */}
                <div style={{
                    transform: `rotate(${angle}deg)`,
                    transition: 'transform 0.1s linear',
                    filter: 'drop-shadow(0 0 10px var(--primary))'
                }}>
                    <Navigation size={120} fill="var(--primary)" color="var(--bg-dark)" strokeWidth={1} />
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '15px 30px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>DISTANCE</div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{distance}m</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '5px' }}>
                    Target: {target.x?.toFixed(0)}, {target.y?.toFixed(0)}, {target.z?.toFixed(0)}
                </div>
            </div>
        </div>
    );
};

export default TrackerArrow;
