import { useState } from 'react';
import type { Pokemon } from '../types';
import { Sparkles, Search } from 'lucide-react';

interface PartyListProps {
    party: Pokemon[];
}

const PartyList = ({ party }: PartyListProps) => {
    const [filter, setFilter] = useState('');

    // Filter and sort alphabetically by species name
    // Support multiple names separated by comma
    const filteredParty = party.filter(p => {
        if (!filter.trim()) return true;

        const filters = filter.split(',').map(f => f.trim().toLowerCase()).filter(f => f.length > 0);
        return filters.some(f => p.species.toLowerCase().includes(f));
    });
    const sortedParty = [...filteredParty].sort((a, b) => a.species.localeCompare(b.species));

    return (
        <div className="glass-panel" style={{ padding: '20px' }}>
            <h2 style={{ marginBottom: '15px' }}>My Party</h2>

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

            <div style={{
                display: 'grid',
                gap: '10px',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))'
            }}>
                {sortedParty.map((p, i) => (
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
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ color: p.hp === 0 ? 'red' : 'var(--primary)' }}>
                                {p.hp}/{p.max_hp} HP
                            </div>
                            <div style={{ width: '80px', height: '4px', background: 'rgba(255,255,255,0.1)', marginTop: '5px', borderRadius: '2px', marginLeft: 'auto' }}>
                                <div style={{
                                    width: `${(p.hp / p.max_hp) * 100}%`,
                                    height: '100%',
                                    background: p.hp === 0 ? 'red' : 'var(--primary)',
                                    borderRadius: '2px'
                                }} />
                            </div>
                        </div>
                    </div>
                ))}
                {sortedParty.length === 0 && (
                    <div className="text-dim" style={{ textAlign: 'center', padding: '20px' }}>
                        {filter ? `No Pokémon found matching "${filter}"` : 'No Pokémon in party...'}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PartyList;
