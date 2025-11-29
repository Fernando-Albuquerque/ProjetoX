import type { BattleData, Pokemon } from '../types';
import { Zap, Shield, Sword, Activity, Crosshair } from 'lucide-react';
import BattleAssistant from './BattleAssistant';
import { getDualEffectiveness } from '../services/typeChart';

interface BattleViewProps {
    battle: BattleData | null;
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

function PokemonBattleCard({ pokemon, side, showIvs = false, opponentPokemon }: { pokemon: Pokemon, side: 'player' | 'opponent', showIvs?: boolean, opponentPokemon?: Pokemon }) {
    const hpPercent = (pokemon.hp / pokemon.max_hp) * 100;
    const hpColor = hpPercent > 50 ? '#4caf50' : hpPercent > 20 ? '#ff9800' : '#f44336';

    const getEffectivenessColor = (multiplier: number) => {
        if (multiplier > 1) return '#4caf50'; // Green
        if (multiplier < 1 && multiplier > 0) return '#f44336'; // Red
        if (multiplier === 0) return '#9e9e9e'; // Grey
        return '#ccc'; // Default/Neutral (White-ish)
    };

    const getEffectivenessIcon = (multiplier: number) => {
        if (multiplier > 1) return '▲';
        if (multiplier < 1 && multiplier > 0) return '▼';
        if (multiplier === 0) return 'X';
        return '-';
    };

    return (
        <div className="glass-panel" style={{
            padding: '12px',
            marginBottom: '8px',
            borderLeft: side === 'player' ? '4px solid #4caf50' : 'none',
            borderRight: side === 'opponent' ? '4px solid #f44336' : 'none',
            background: side === 'player' ? 'rgba(76, 175, 80, 0.05)' : 'rgba(244, 67, 54, 0.05)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '1rem' }}>
                        {pokemon.species} <span style={{ fontSize: '0.8rem', color: '#aaa' }}>Lvl {pokemon.level}</span>
                    </h3>
                    {pokemon.types && pokemon.types.map(t => {
                        // Calculate effectiveness of this type against the opponent
                        const effectiveness = opponentPokemon && opponentPokemon.types
                            ? getDualEffectiveness(t, opponentPokemon.types)
                            : 1;

                        const effColor = getEffectivenessColor(effectiveness);
                        const effIcon = getEffectivenessIcon(effectiveness);

                        return (
                            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                <span style={{
                                    background: TYPE_COLORS[t.toLowerCase()] || '#777',
                                    color: 'white',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    fontSize: '0.6rem',
                                    textTransform: 'uppercase',
                                    fontWeight: 'bold',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.3)'
                                }}>
                                    {t}
                                </span>
                                {opponentPokemon && (
                                    <span style={{
                                        color: effColor,
                                        fontWeight: 'bold',
                                        fontSize: '0.7rem',
                                        marginLeft: '1px'
                                    }}>
                                        {effIcon}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
                {pokemon.status !== 'None' && (
                    <span style={{
                        background: '#ff5555', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold'
                    }}>
                        {pokemon.status}
                    </span>
                )}
            </div>

            {/* HP Bar */}
            <div style={{ background: '#333', height: '6px', borderRadius: '3px', overflow: 'hidden', marginBottom: '8px' }}>
                <div style={{
                    width: `${hpPercent}%`,
                    background: hpColor,
                    height: '100%',
                    transition: 'width 0.5s ease'
                }} />
            </div>
            <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#ccc', marginBottom: '8px' }}>
                {pokemon.hp} / {pokemon.max_hp} HP
            </div>

            {/* Moves Grid (Player Side Only) */}
            {side === 'player' && pokemon.moves && pokemon.moves.length > 0 && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '6px',
                    marginTop: '10px',
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    paddingTop: '8px'
                }}>
                    {pokemon.moves.map((move, mIdx) => {
                        // Calculate effectiveness if opponent is known
                        const effectiveness = opponentPokemon && opponentPokemon.types
                            ? getDualEffectiveness(move.type, opponentPokemon.types)
                            : 1;

                        const effColor = getEffectivenessColor(effectiveness);
                        const effIcon = getEffectivenessIcon(effectiveness);

                        return (
                            <div key={mIdx} style={{
                                background: 'rgba(0,0,0,0.2)',
                                padding: '6px 8px',
                                borderRadius: '6px',
                                borderLeft: `3px solid ${TYPE_COLORS[move.type.toLowerCase()] || '#777'}`,
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.8rem', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '85%' }}>
                                        {move.name}
                                    </span>
                                    {opponentPokemon && (
                                        <span style={{
                                            color: effColor,
                                            fontWeight: 'bold',
                                            fontSize: '0.8rem'
                                        }}>
                                            {effIcon}
                                        </span>
                                    )}
                                </div>
                                <div style={{ display: 'flex', gap: '4px', fontSize: '0.65rem', color: '#888', marginTop: '2px', alignItems: 'center' }}>
                                    <span style={{ textTransform: 'capitalize' }}>{move.type}</span>
                                    {opponentPokemon && (
                                        <span style={{ color: effColor, fontWeight: 'bold', fontSize: '0.65rem' }}>
                                            {effIcon}
                                        </span>
                                    )}
                                    <span>•</span>
                                    <span style={{ textTransform: 'capitalize' }}>{move.category}</span>
                                </div>
                                {/* Effectiveness Background Hint */}
                                {opponentPokemon && effectiveness > 1 && (
                                    <div style={{
                                        position: 'absolute',
                                        right: 0,
                                        top: 0,
                                        bottom: 0,
                                        width: '4px',
                                        background: effColor
                                    }} />
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* IVs Display (Only if showIvs is true) */}
            {showIvs && pokemon.ivs && (
                <div style={{
                    marginTop: '8px',
                    padding: '8px',
                    background: 'rgba(0,0,0,0.3)',
                    borderRadius: '6px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '4px',
                    fontSize: '0.75rem'
                }}>
                    {Object.entries(pokemon.ivs).map(([stat, value]) => {
                        const isPerfect = value === 31;
                        const label = stat.replace('special_attack', 'SpA').replace('special_defence', 'SpD').replace('attack', 'Atk').replace('defence', 'Def').replace('speed', 'Spe').replace('hp', 'HP');

                        return (
                            <div key={stat} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                color: isPerfect ? '#ffd700' : '#aaa',
                                fontWeight: isPerfect ? 'bold' : 'normal'
                            }}>
                                <span>{label}:</span>
                                <span>{value}</span>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Basic Stats (if IVs not shown and NOT player side, to avoid clutter) */}
            {!showIvs && side !== 'player' && (
                <div style={{ display: 'flex', gap: '10px', fontSize: '0.8rem', color: '#aaa' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} title="Attack">
                        <Sword size={12} /> {pokemon.stats.attack}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} title="Defense">
                        <Shield size={12} /> {pokemon.stats.defence}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} title="Speed">
                        <Zap size={12} /> {pokemon.stats.speed}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function BattleView({ battle }: BattleViewProps) {
    if (!battle || battle.status !== 'active' || !battle.actors) {
        return (
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: '#aaa' }}>
                <Activity size={48} style={{ marginBottom: '20px', opacity: 0.5 }} />
                <h2>Sem Batalha Ativa</h2>
                <p>Entre em uma batalha para ver os dados em tempo real.</p>
            </div>
        );
    }

    const playerActor = battle.actors.find(a => a.side === 'SideA' || a.side === 'Player');
    const opponentActor = battle.actors.find(a => a.side === 'SideB' || a.side === 'Opponent');

    const actor1 = playerActor || battle.actors[0];
    const actor2 = opponentActor || battle.actors[1];

    return (
        <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', height: '100%' }}>

            {/* Opponent Section (Top) */}
            <div style={{ marginBottom: '5px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#f44336' }}>
                    <Crosshair size={18} />
                    <h3 style={{ margin: 0, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Oponente</h3>
                </div>
                {actor2 && (
                    actor2.pokemon.length > 0 ? (
                        actor2.pokemon.map((p, i) => (
                            <PokemonBattleCard key={`opp-${i}`} pokemon={p} side="opponent" showIvs={true} />
                        ))
                    ) : (
                        // Fallback: Exibe apenas o nome real do oponente (ex: "Bouffalant")
                        <div className="glass-panel" style={{
                            padding: '12px',
                            marginBottom: '8px',
                            borderRight: '4px solid #f44336',
                            background: 'rgba(244, 67, 54, 0.05)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
                                {actor2.name}
                            </h3>
                            <span style={{ fontSize: '0.8rem', color: '#aaa', border: '1px solid #444', padding: '2px 6px', borderRadius: '4px' }}>
                                Sem dados detalhados
                            </span>
                        </div>
                    )
                )}
            </div>

            {/* Divider */}
            <div style={{
                height: '1px',
                background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.2), transparent)',
                margin: '5px 0 5px 0'
            }} />

            {/* Player Section (Bottom) */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#4caf50', position: 'sticky', top: 0, background: '#1a1a1a', zIndex: 10, paddingBottom: '5px' }}>
                    <Shield size={18} />
                    <h3 style={{ margin: 0, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Você</h3>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '10px'
                }}>
                    {actor1 && actor1.pokemon.map((p, i) => (
                        <PokemonBattleCard
                            key={`pl-${i}`}
                            pokemon={p}
                            side="player"
                            showIvs={false}
                            opponentPokemon={actor2 && actor2.pokemon.length > 0 ? actor2.pokemon[0] : undefined}
                        />
                    ))}
                </div>
            </div>

            {/* Battle Assistant */}
            {actor1 && actor1.pokemon.length > 0 && actor2 && actor2.pokemon.length > 0 && (
                <BattleAssistant
                    playerPokemon={actor1.pokemon[0]}
                    opponentPokemon={actor2.pokemon[0]}
                    playerParty={actor1.pokemon}
                />
            )}
        </div>
    );
}
