import { useState } from 'react';
import type { Pokemon } from '../types';
import { Sparkles, Search } from 'lucide-react';

interface PartyListProps {
    party: Pokemon[];
}

const TYPE_COLORS: Record<string, string> = {
    normal: '#A8A77A',
    fire: '#EE8130',
    water: '#6390F0',
    electric: '#F7D02C',
    grass: '#7AC74C',
    ice: '#96D9D6',
    fighting: '#C22E28',
    poison: '#A33EA1',
    ground: '#E2BF65',
    flying: '#A98FF3',
    psychic: '#F95587',
    bug: '#A6B91A',
    rock: '#B6A136',
    ghost: '#735797',
    dragon: '#6F35FC',
    dark: '#705746',
    steel: '#B7B7CE',
    fairy: '#D685AD',
};

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
                        flexDirection: 'column',
                        gap: '10px'
                    }}>
                        {/* Header: Species, Info, HP */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{p.species}</span>
                                    {p.shiny && <Sparkles size={16} className="text-accent" />}
                                </div>
                                <div className="text-dim" style={{ fontSize: '0.85rem', marginBottom: '4px' }}>
                                    Lvl {p.level} • {p.gender}
                                </div>
                                {/* Types */}
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    {p.types && p.types.map(t => (
                                        <span key={t} style={{
                                            background: TYPE_COLORS[t.toLowerCase()] || '#777',
                                            color: 'white',
                                            padding: '2px 6px',
                                            borderRadius: '4px',
                                            fontSize: '0.65rem',
                                            textTransform: 'uppercase',
                                            fontWeight: 'bold',
                                            boxShadow: '0 1px 2px rgba(0,0,0,0.3)'
                                        }}>
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div style={{ textAlign: 'right', minWidth: '80px' }}>
                                <div style={{ color: p.hp === 0 ? 'red' : 'var(--primary)', fontSize: '0.9rem', fontWeight: 'bold' }}>
                                    {p.hp}/{p.max_hp}
                                </div>
                                <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', marginTop: '5px', borderRadius: '2px' }}>
                                    <div style={{
                                        width: `${(p.hp / p.max_hp) * 100}%`,
                                        height: '100%',
                                        background: p.hp === 0 ? 'red' : 'var(--primary)',
                                        borderRadius: '2px'
                                    }} />
                                </div>
                            </div>
                        </div>

                        {/* Divider */}
                        <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)' }} />

                        {/* Moves Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            {p.moves && p.moves.length > 0 ? (
                                p.moves.map((move, mIdx) => (
                                    <div key={mIdx} style={{
                                        background: 'rgba(0,0,0,0.2)',
                                        padding: '6px 8px',
                                        borderRadius: '6px',
                                        borderLeft: `3px solid ${TYPE_COLORS[move.type.toLowerCase()] || '#777'}`
                                    }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {move.name}
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#aaa', marginTop: '2px' }}>
                                            <span style={{ textTransform: 'capitalize' }}>{move.type}</span>
                                            <span style={{ textTransform: 'capitalize' }}>{move.category}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#555', fontSize: '0.8rem', fontStyle: 'italic' }}>
                                    No moves known
                                </div>
                            )}
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
