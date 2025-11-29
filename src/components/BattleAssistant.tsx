import { useEffect, useState } from 'react';
import type { Pokemon } from '../types';
import { analyzeMatchup } from '../services/battleAnalysis';
import type { BattleSuggestion } from '../services/battleAnalysis';
import { Lightbulb } from 'lucide-react';

interface BattleAssistantProps {
    playerPokemon: Pokemon | undefined;
    opponentPokemon: Pokemon | undefined;
    playerParty: Pokemon[];
}

export default function BattleAssistant({ playerPokemon, opponentPokemon, playerParty }: BattleAssistantProps) {
    const [suggestions, setSuggestions] = useState<BattleSuggestion[]>([]);

    useEffect(() => {
        if (playerPokemon && opponentPokemon) {
            const newSuggestions = analyzeMatchup(playerPokemon, opponentPokemon, playerParty);
            setSuggestions(newSuggestions);
        }
    }, [playerPokemon, opponentPokemon, playerParty]);

    if (!playerPokemon || !opponentPokemon) return null;

    return (
        <div className="glass-panel" style={{ marginTop: '10px', padding: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: '#FFD700' }}>
                <Lightbulb size={18} />
                <h3 style={{ margin: 0, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Assistente Tático</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {suggestions.map((suggestion, idx) => (
                    <div key={idx} style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        padding: '8px',
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '6px',
                        borderLeft: `3px solid ${suggestion.type === 'safe' ? '#4caf50' :
                            suggestion.type === 'balanced' ? '#2196f3' : '#f44336'
                            }`
                    }}>
                        <div style={{ fontSize: '1.2rem' }}>{suggestion.icon}</div>
                        <div>
                            <div style={{ fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '2px' }}>
                                {suggestion.title}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#ccc', lineHeight: '1.2' }}>
                                {suggestion.description}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
