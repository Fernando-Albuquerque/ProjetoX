import { useState, useEffect } from 'react';
import type { Pokemon, PlayerData } from '../services/api';
import { isLegendaryPokemon } from '../services/api';
import { Sparkles, Search, Crown, Star, Navigation } from 'lucide-react';

interface NearbyListProps {
    nearby: Pokemon[];
    player: PlayerData | null;
}

const NearbyList = ({ nearby, player }: NearbyListProps) => {
    const [filter, setFilter] = useState('');

    // Filter and sort
    const filteredNearby = nearby.filter(p => {
        // Always show special pokemon
        if (p.shiny || isLegendaryPokemon(p.species) || p.is_mythical) return true;

        if (!filter.trim()) return true;

        const filters = filter.split(',').map(f => f.trim().toLowerCase()).filter(f => f.length > 0);
        return filters.some(f => p.species.toLowerCase().includes(f));
    });

    const sortedNearby = [...filteredNearby].sort((a, b) => {
        // Sort priority: Legendary/Mythical > Shiny > Name
        const aSpecial = isLegendaryPokemon(a.species) || a.is_mythical;
        const bSpecial = isLegendaryPokemon(b.species) || b.is_mythical;
        if (aSpecial && !bSpecial) return -1;
        if (!aSpecial && bSpecial) return 1;

        if (a.shiny && !b.shiny) return -1;
        if (!a.shiny && b.shiny) return 1;

        return a.species.localeCompare(b.species);
    });

    return (
        <div className="glass-panel" style={{ padding: '20px' }}>
            <h2 style={{ marginBottom: '15px' }}>Nearby Pokémon</h2>

            {/* Filter Input */}
            <div style={{ marginBottom: '15px', position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input
                    type="text"
                    placeholder="Filter by name..."
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
                {sortedNearby.map((p, i) => (
                    <PokemonCard key={i} pokemon={p} player={player} />
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

const PokemonCard = ({ pokemon, player }: { pokemon: Pokemon, player: PlayerData | null }) => {
    const isSpecial = isLegendaryPokemon(pokemon.species) || pokemon.is_mythical;
    const isShiny = pokemon.shiny;

    // Card Styling
    let borderColor = 'rgba(255,255,255,0.05)';
    let bgGradient = 'rgba(255,255,255,0.05)';

    if (isSpecial) {
        borderColor = '#d4af37'; // Gold
        bgGradient = 'linear-gradient(45deg, rgba(212, 175, 55, 0.1), rgba(0,0,0,0.3))';
    } else if (isShiny) {
        borderColor = '#00ff9d'; // Green/Cyan
        bgGradient = 'linear-gradient(45deg, rgba(0, 255, 157, 0.1), rgba(0,0,0,0.3))';
    }

    // IV Display Logic
    const perfectIvs = pokemon.ivs ? Object.entries(pokemon.ivs).filter(([_, val]) => val === 31) : [];

    return (
        <div style={{
            background: bgGradient,
            border: `1px solid ${borderColor}`,
            padding: '15px',
            borderRadius: '12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: isSpecial ? '#ffd700' : 'white' }}>
                        {pokemon.species}
                    </span>
                    {pokemon.shiny && <Sparkles size={16} color="#00ff9d" fill="#00ff9d" />}
                    {isLegendaryPokemon(pokemon.species) && <Crown size={16} color="#ffd700" fill="#ffd700" />}
                    {pokemon.is_mythical && <Star size={16} color="#ff55ff" fill="#ff55ff" />}
                </div>

                <div className="text-dim" style={{ fontSize: '0.85rem' }}>
                    Lvl {pokemon.level} • {pokemon.gender}
                </div>

                {/* IVs Display */}
                {perfectIvs.length > 0 && (
                    <div style={{ display: 'flex', gap: '4px', marginTop: '6px', flexWrap: 'wrap' }}>
                        {perfectIvs.map(([stat, _]) => (
                            <span key={stat} style={{
                                fontSize: '0.7rem',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                background: 'rgba(255, 215, 0, 0.2)',
                                color: '#ffd700',
                                border: '1px solid rgba(255, 215, 0, 0.3)',
                                textTransform: 'uppercase'
                            }}>
                                {stat.replace('special_', 'sp.').replace('defence', 'def')}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Tracker Arrow */}
            {player && pokemon.x && pokemon.z && (
                <MiniTracker player={player} target={pokemon} />
            )}
        </div>
    );
};

const MiniTracker = ({ player, target }: { player: PlayerData, target: Pokemon }) => {
    const [angle, setAngle] = useState(0);
    const [distance, setDistance] = useState(0);

    useEffect(() => {
        if (!target.x || !target.z) return;

        const dx = target.x - player.x;
        const dz = target.z - player.z;

        // Calculate angle
        const targetAngle = Math.atan2(dz, dx) * (180 / Math.PI);
        let relativeAngle = targetAngle - 90 - player.yaw;
        setAngle(relativeAngle);

        // Calculate distance
        const dist = Math.sqrt(dx * dx + dz * dz);
        setDistance(dist);

    }, [player, target]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '60px' }}>
            <div style={{
                transform: `rotate(${angle}deg)`,
                transition: 'transform 0.1s linear',
                marginBottom: '4px'
            }}>
                <Navigation size={24} fill="var(--primary)" color="var(--primary)" />
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                {distance.toFixed(0)}m
            </span>
        </div>
    );
};

export default NearbyList;
