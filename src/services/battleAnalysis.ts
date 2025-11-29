import type { Pokemon } from '../types';
import { getDualEffectiveness } from './typeChart';

export interface BattleSuggestion {
    type: 'safe' | 'balanced' | 'risky';
    title: string;
    description: string;
    icon: string;
}

export function analyzeMatchup(playerPokemon: Pokemon, opponentPokemon: Pokemon, playerParty: Pokemon[] = []): BattleSuggestion[] {
    const suggestions: BattleSuggestion[] = [];

    if (!playerPokemon.types || !opponentPokemon.types) {
        return [{
            type: 'balanced',
            title: 'Analisando...',
            description: 'Aguardando dados de tipos para sugerir estratégias.',
            icon: '🔍'
        }];
    }

    // --- 1. Analyze Active Matchup ---
    let maxIncomingDamageMultiplier = 0;
    for (const oppType of opponentPokemon.types) {
        const mult = getDualEffectiveness(oppType, playerPokemon.types);
        if (mult > maxIncomingDamageMultiplier) maxIncomingDamageMultiplier = mult;
    }

    let maxOutgoingDamageMultiplier = 0;
    let bestType = '';
    let bestActiveMove = '';
    let bestActiveMovePower = 0;

    // Find best move for active pokemon
    if (playerPokemon.moves) {
        for (const move of playerPokemon.moves) {
            if (move.category === 'Status') continue;
            const mult = getDualEffectiveness(move.type, opponentPokemon.types);

            // Simple power estimation: effectiveness * 60 (base power assumption if unknown)
            // Ideally we'd use move.power but it's often 0 in current data
            const estimatedPower = mult * 60;

            if (mult > maxOutgoingDamageMultiplier) {
                maxOutgoingDamageMultiplier = mult;
                bestType = move.type;
                bestActiveMove = move.name;
            } else if (mult === maxOutgoingDamageMultiplier) {
                // If tie, pick one (could add logic for STAB here later)
                if (!bestActiveMove) bestActiveMove = move.name;
            }
        }
    }

    // Fallback if no moves found
    if (!bestType && playerPokemon.types.length > 0) {
        for (const myType of playerPokemon.types) {
            const mult = getDualEffectiveness(myType, opponentPokemon.types);
            if (mult > maxOutgoingDamageMultiplier) {
                maxOutgoingDamageMultiplier = mult;
                bestType = myType;
            }
        }
    }

    // --- 2. Analyze Bench for Switches ---
    let bestSwitchCandidate: Pokemon | null = null;
    let bestSwitchMove: string = '';
    let bestSwitchScore = -100;

    for (const benchPoke of playerParty) {
        // Skip active pokemon and fainted ones
        if (benchPoke === playerPokemon || benchPoke.hp <= 0) continue;
        if (!benchPoke.types) continue;

        let score = 0;

        // Defensive Score (Lower incoming dmg is better)
        let benchIncomingDmg = 0;
        for (const oppType of opponentPokemon.types) {
            const mult = getDualEffectiveness(oppType, benchPoke.types);
            if (mult > benchIncomingDmg) benchIncomingDmg = mult;
        }

        if (benchIncomingDmg <= 0.5) score += 2; // Resists
        if (benchIncomingDmg >= 2) score -= 2;   // Weak

        // Offensive Score (Check MOVES instead of just types)
        let maxMoveEffectiveness = 0;
        let bestMoveName = '';

        if (benchPoke.moves && benchPoke.moves.length > 0) {
            for (const move of benchPoke.moves) {
                if (move.category === 'Status') continue;

                const mult = getDualEffectiveness(move.type, opponentPokemon.types);
                if (mult > maxMoveEffectiveness) {
                    maxMoveEffectiveness = mult;
                    bestMoveName = move.name;
                }
            }
        } else {
            for (const myType of benchPoke.types) {
                const mult = getDualEffectiveness(myType, opponentPokemon.types);
                if (mult > maxMoveEffectiveness) {
                    maxMoveEffectiveness = mult;
                    bestMoveName = `Golpe ${myType}`;
                }
            }
        }

        if (maxMoveEffectiveness >= 4) score += 4; // Ultra Effective
        else if (maxMoveEffectiveness >= 2) score += 2; // Super Effective
        else if (maxMoveEffectiveness <= 0.5) score -= 1; // Not Effective

        // Check if this is the best candidate so far
        if (score > bestSwitchScore && score >= 2) {
            bestSwitchScore = score;
            bestSwitchCandidate = benchPoke;
            bestSwitchMove = bestMoveName;
        }
    }

    // --- SAFE STRATEGY ---
    if (maxIncomingDamageMultiplier >= 2) {
        if (bestSwitchCandidate) {
            suggestions.push({
                type: 'safe',
                title: `Troque para ${bestSwitchCandidate.species}!`,
                description: `Você está em perigo. ${bestSwitchCandidate.species} pode usar ${bestSwitchMove} para virar o jogo!`,
                icon: '🔄'
            });
        } else {
            suggestions.push({
                type: 'safe',
                title: 'Cuidado! Fraqueza',
                description: `Você recebe ${maxIncomingDamageMultiplier}x de dano. Jogue defensivamente ou cure-se.`,
                icon: '🛡️'
            });
        }
    } else if (maxIncomingDamageMultiplier <= 0.5) {
        suggestions.push({
            type: 'safe',
            title: 'Tanque Seguro',
            description: 'Você resiste aos ataques dele. Mantenha-se em campo.',
            icon: '🛡️'
        });
    } else {
        if (bestSwitchCandidate && bestSwitchScore >= 3) {
            suggestions.push({
                type: 'safe',
                title: `Considere ${bestSwitchCandidate.species}`,
                description: `${bestSwitchCandidate.species} tem o golpe ${bestSwitchMove} que seria devastador aqui.`,
                icon: '🔄'
            });
        } else {
            suggestions.push({
                type: 'safe',
                title: 'Jogue com Calma',
                description: 'Dano neutro recebido. Cure-se se necessário.',
                icon: '🛡️'
            });
        }
    }

    // --- BALANCED STRATEGY ---
    if (maxOutgoingDamageMultiplier >= 2) {
        suggestions.push({
            type: 'balanced',
            title: `Use ${bestActiveMove || bestType}`,
            description: `Golpe super efetivo! Causa ${maxOutgoingDamageMultiplier}x de dano.`,
            icon: '⚖️'
        });
    } else if (maxOutgoingDamageMultiplier <= 0.5) {
        if (bestSwitchCandidate) {
            suggestions.push({
                type: 'balanced',
                title: `Troque para ${bestSwitchCandidate.species}`,
                description: `Seus ataques não funcionam bem. ${bestSwitchCandidate.species} tem ${bestSwitchMove}.`,
                icon: '🔄'
            });
        } else {
            suggestions.push({
                type: 'balanced',
                title: 'Ataque Pouco Efetivo',
                description: 'Tente golpes de cobertura ou status.',
                icon: '⚖️'
            });
        }
    } else {
        // Neutral matchup - suggest strongest neutral move
        if (bestActiveMove) {
            suggestions.push({
                type: 'balanced',
                title: `Use ${bestActiveMove}`,
                description: 'Sua melhor opção de dano neutro no momento.',
                icon: '⚖️'
            });
        } else {
            suggestions.push({
                type: 'balanced',
                title: 'Dano Neutro',
                description: 'Use seus golpes mais fortes para causar dano constante.',
                icon: '⚖️'
            });
        }
    }

    // --- RISKY STRATEGY ---
    if (playerPokemon.hp < playerPokemon.max_hp * 0.3) {
        suggestions.push({
            type: 'risky',
            title: 'Tudo ou Nada',
            description: 'Vida crítica! Use seu golpe mais forte ou um item de cura agora.',
            icon: '⚔️'
        });
    } else {
        // Check for specific status/setup moves
        const statusMoves = playerPokemon.moves?.filter(m => m.category === 'Status') || [];
        const usefulStatusMove = statusMoves.find(m =>
            ['thunderwave', 'willowisp', 'toxic', 'sleeppowder', 'spore', 'hypnosis', 'swordsdance', 'calmmind', 'nastyplot', 'shellsmash'].includes(m.name.toLowerCase().replace(/[^a-z]/g, ''))
        );

        if (usefulStatusMove) {
            suggestions.push({
                type: 'risky',
                title: `Use ${usefulStatusMove.name}`,
                description: 'Um bom momento para aplicar status ou aumentar seus atributos.',
                icon: '✨'
            });
        } else {
            // If no specific status moves, suggest a high-power risky play or general advice
            suggestions.push({
                type: 'risky',
                title: 'Pressão Ofensiva',
                description: 'Continue atacando para manter a pressão no oponente.',
                icon: '⚔️'
            });
        }
    }

    return suggestions;
}
