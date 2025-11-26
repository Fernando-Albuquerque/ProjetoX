import type { BattleData, Pokemon } from '../types';
import { Zap, Shield, Sword, Activity } from 'lucide-react';

interface BattleViewProps {
    battle: BattleData | null;
}

function PokemonBattleCard({ pokemon, side }: { pokemon: Pokemon, side: 'player' | 'opponent' }) {
    const hpPercent = (pokemon.hp / pokemon.max_hp) * 100;
    const hpColor = hpPercent > 50 ? '#4caf50' : hpPercent > 20 ? '#ff9800' : '#f44336';

    return (
        <div className="glass-panel" style={{
            padding: '15px',
            marginBottom: '10px',
            borderLeft: side === 'player' ? '4px solid #4caf50' : 'none',
            borderRight: side === 'opponent' ? '4px solid #f44336' : 'none',
            background: side === 'player' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
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
            <div style={{ background: '#333', height: '8px', borderRadius: '4px', overflow: 'hidden', marginBottom: '10px' }}>
                <div style={{
                    width: `${hpPercent}%`,
                    background: hpColor,
                    height: '100%',
                    transition: 'width 0.5s ease'
                }} />
            </div>
            <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#ccc', marginBottom: '10px' }}>
                {pokemon.hp} / {pokemon.max_hp} HP
            </div>

            {/* Stats / Moves */}
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

            {/* Moves (Only for player usually, but API might send for both) */}
            {pokemon.moves && pokemon.moves.length > 0 && (
                <div style={{ marginTop: '10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
                    {pokemon.moves.map((move, idx) => (
                        <div key={idx} style={{
                            background: 'rgba(0,0,0,0.3)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem',
                            display: 'flex', justifyContent: 'space-between'
                        }}>
                            <span>{move.name}</span>
                            <span style={{ color: '#aaa' }}>{move.type}</span>
                        </div>
                    ))}
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

    const playerActor = battle.actors.find(a => a.side === 'SideA' || a.side === 'Player'); // Adjust based on actual API response
    const opponentActor = battle.actors.find(a => a.side === 'SideB' || a.side === 'Opponent');

    // Fallback if sides are not named as expected
    const actor1 = playerActor || battle.actors[0];
    const actor2 = opponentActor || battle.actors[1];

    return (
        <div style={{ padding: '10px' }}>
            <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                <h2 style={{ margin: 0, color: '#ff9800' }}>⚔️ EM COMBATE ⚔️</h2>
            </div>

            {actor2 && actor2.pokemon.map((p, i) => (
                <PokemonBattleCard key={`opp-${i}`} pokemon={p} side="opponent" />
            ))}

            <div style={{ textAlign: 'center', margin: '10px 0', fontWeight: 'bold', color: '#aaa' }}>VS</div>

            {actor1 && actor1.pokemon.map((p, i) => (
                <PokemonBattleCard key={`pl-${i}`} pokemon={p} side="player" />
            ))}
        </div>
    );
}
