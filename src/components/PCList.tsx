import type { Pokemon } from '../types';
import { Database } from 'lucide-react';

interface PCListProps {
    pc: Pokemon[];
}

export default function PCList({ pc }: PCListProps) {
    if (!pc || pc.length === 0) {
        return (
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: '#aaa' }}>
                <Database size={48} style={{ marginBottom: '20px', opacity: 0.5 }} />
                <h2>PC Vazio</h2>
                <p>Nenhum Pokémon encontrado no PC.</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '10px' }}>
            <h2 style={{ margin: '0 0 15px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Database size={24} /> PC ({pc.length})
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>
                {pc.map((pokemon, index) => (
                    <div key={index} className="glass-panel" style={{ padding: '10px', textAlign: 'center', position: 'relative' }}>
                        {pokemon.shiny && (
                            <span style={{ position: 'absolute', top: '5px', right: '5px', fontSize: '1.2rem' }}>✨</span>
                        )}
                        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{pokemon.species}</div>
                        <div style={{ fontSize: '0.8rem', color: '#aaa' }}>Lvl {pokemon.level}</div>
                        <div style={{ fontSize: '0.8rem', color: '#aaa' }}>{pokemon.gender}</div>

                        {/* IV Summary if available */}
                        {pokemon.ivs && (
                            <div style={{ marginTop: '5px', fontSize: '0.7rem', color: '#888' }}>
                                IVs: {Math.floor((pokemon.ivs.hp + pokemon.ivs.attack + pokemon.ivs.defence + pokemon.ivs.special_attack + pokemon.ivs.special_defence + pokemon.ivs.speed) / 6)}%
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
