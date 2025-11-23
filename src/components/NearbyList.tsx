import { useState } from 'react';
import type { Pokemon } from '../services/api';
import { MapPin, Sparkles, Search } from 'lucide-react';

interface NearbyListProps {
    nearby: Pokemon[];
    onTrack: (pokemon: Pokemon) => void;
}

const NearbyList = ({ nearby, onTrack }: NearbyListProps) => {
    const [filter, setFilter] = useState('');

    // Filter and sort alphabetically by species name
    // Support multiple names separated by comma
    const filteredNearby = nearby.filter(p => {
        if (!filter.trim()) return true;

        const filters = filter.split(',').map(f => f.trim().toLowerCase()).filter(f => f.length > 0);
        return filters.some(f => p.species.toLowerCase().includes(f));
    });
    const sortedNearby = [...filteredNearby].sort((a, b) => a.species.localeCompare(b.species));

    return (
        <div className="glass-panel" style={{ padding: '20px' }}>
            <h2 style={{ marginBottom: '15px' }}>Nearby Pokémon</h2>

            {/* Filter Input */}
            <div style={{ marginBottom: '15px', position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input
                    type="text"
                    placeholder="Filter by name (ex: Pika, Char, Bulba)..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '10px 10px 10px 40px',
                        background: 'rgba(0,0,0,0.3)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: 'white',
                        fontSize: '0.9rem',
                        outline: 'none'
                    }}
                />
            </div>

            <div style={{ display: 'grid', gap: '10px' }}>
                {sortedNearby.map((p, i) => (
                    <div key={i} style={{
                        background: 'rgba(255,255,255,0.05)',
                        padding: '15px',
                        borderRadius: '12px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{p.species}</span>
                                {p.shiny && <Sparkles size={16} className="text-accent" />}
                            </div>
                            <div className="text-dim">Lvl {p.level} • {p.gender}</div>
                            <div className="text-dim" style={{ fontSize: '0.8rem', marginTop: '2px' }}>
                                {p.x?.toFixed(0)}, {p.y?.toFixed(0)}, {p.z?.toFixed(0)}
                            </div>
                        </div>
                        <button
                            onClick={() => onTrack(p)}
                            style={{
                                background: 'rgba(0, 255, 157, 0.1)',
                                border: '1px solid var(--primary)',
                                color: 'var(--primary)',
                                borderRadius: '8px',
                                padding: '8px 12px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                                transition: 'all 0.2s'
                            }}
                            className="hover-glow"
                        >
                            <MapPin size={16} />
                            TRACK
                        </button>
                    </div>
                ))}
                {sortedNearby.length === 0 && (
                    <div className="text-dim" style={{ textAlign: 'center', padding: '20px' }}>
                        {filter ? `No Pokémon found matching "${filter}"` : 'No Pokémon nearby...'}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NearbyList;
