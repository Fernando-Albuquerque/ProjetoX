import type { BattleData, Pokemon } from '../types';
import { Zap, Shield, Sword, Activity, Crosshair } from 'lucide-react';

interface BattleViewProps {
    battle: BattleData | null;
}

function PokemonBattleCard({ pokemon, side, showIvs = false }: { pokemon: Pokemon, side: 'player' | 'opponent', showIvs?: boolean }) {
    const hpPercent = (pokemon.hp / pokemon.max_hp) * 100;
    const hpColor = hpPercent > 50 ? '#4caf50' : hpPercent > 20 ? '#ff9800' : '#f44336';

    return (
        <div className="glass-panel" style={{
            padding: '12px',
            marginBottom: '8px',
            borderLeft: side === 'player' ? '4px solid #4caf50' : 'none',
            borderRight: side === 'opponent' ? '4px solid #f44336' : 'none',
            background: side === 'player' ? 'rgba(76, 175, 80, 0.05)' : 'rgba(244, 67, 54, 0.05)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                <h3 style={{ margin: 0, fontSize: '1rem' }}>
                    {pokemon.species} <span style={{ fontSize: '0.8rem', color: '#aaa' }}>Lvl {pokemon.level}</span>
                </h3>
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

            {/* Basic Stats (if IVs not shown) */}
            {!showIvs && (
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
            <div style={{ flex: 1, marginBottom: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#f44336' }}>
                    <Crosshair size={18} />
                    <h3 style={{ margin: 0, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Oponente</h3>
                </div>
                {actor2 && actor2.pokemon.map((p, i) => (
                    <PokemonBattleCard key={`opp-${i}`} pokemon={p} side="opponent" showIvs={true} />
                ))}
            </div>

            {/* Divider */}
            <div style={{
                height: '1px',
                background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.2), transparent)',
                margin: '5px 0 15px 0'
            }} />

            {/* Player Section (Bottom) */}
            <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#4caf50' }}>
                    <Shield size={18} />
                    <h3 style={{ margin: 0, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Você</h3>
                </div>
                {actor1 && actor1.pokemon.map((p, i) => (
                    <PokemonBattleCard key={`pl-${i}`} pokemon={p} side="player" showIvs={false} />
                ))}
            </div>
        </div>
    );
}
