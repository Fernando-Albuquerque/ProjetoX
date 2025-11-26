import { GoogleGenerativeAI } from "@google/generative-ai";
import type { BattleData, Pokemon, PlayerData } from "../types";

export interface ChatMessage {
    role: "user" | "model";
    text: string;
}

export interface GameContext {
    player?: PlayerData | null;
    party?: Pokemon[];
    battle?: BattleData | null;
    nearby?: Pokemon[];
    pc?: Pokemon[];
}

export const geminiService = {
    async sendMessage(
        apiKey: string,
        history: ChatMessage[],
        message: string,
        context: GameContext,
        mode: 'battle' | 'general' = 'battle'
    ): Promise<string> {
        if (!apiKey) {
            throw new Error("API Key do Gemini não configurada.");
        }

        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

            // Construct system prompt based on mode
            let systemPrompt = "Você é um assistente especialista em Pokémon (Cobblemon). ";

            if (mode === 'battle') {
                systemPrompt += "MODO: ASSISTENTE DE BATALHA. ";
                systemPrompt += "Foque EXCLUSIVAMENTE na batalha atual. Analise tipos, fraquezas, stats e moves. ";
                systemPrompt += "Seja direto e tático. Sugira o melhor movimento.\n\n";
            } else {
                systemPrompt += "MODO: ASSISTENTE GERAL. ";
                systemPrompt += "Você tem acesso ao PC e Party do jogador. Ajude com gerenciamento de time, breeds e dúvidas gerais.\n\n";
            }

            if (context.player) {
                systemPrompt += `JOGADOR: ${context.player.name} (HP: ${context.player.health}/${context.player.max_health})\n`;
                systemPrompt += `LOCAL: ${context.player.dimension} (X:${context.player.x.toFixed(0)}, Y:${context.player.y.toFixed(0)}, Z:${context.player.z.toFixed(0)})\n\n`;
            }

            // Battle Data (Critical for Battle Mode)
            if (context.battle && context.battle.status === "active") {
                systemPrompt += "BATALHA ATIVA:\n";
                context.battle.actors?.forEach(actor => {
                    systemPrompt += `- ${actor.name} (${actor.side}):\n`;
                    actor.pokemon.forEach(p => {
                        systemPrompt += `  * ${p.species} (Lvl ${p.level}) HP: ${p.hp}/${p.max_hp} Status: ${p.status}\n`;
                        systemPrompt += `    Moves: ${p.moves.map(m => m.name).join(", ")}\n`;
                        systemPrompt += `    Stats: Atk ${p.stats.attack}, Def ${p.stats.defence}, SpA ${p.stats.special_attack}, SpD ${p.stats.special_defence}, Spe ${p.stats.speed}\n`;
                    });
                });
                systemPrompt += "\n";
            } else if (mode === 'battle') {
                systemPrompt += "Nenhuma batalha ativa no momento.\n\n";
            }

            // Party Data (Always relevant)
            if (context.party) {
                systemPrompt += "PARTY DO JOGADOR:\n";
                context.party.forEach(p => {
                    systemPrompt += `- ${p.species} (Lvl ${p.level}) HP: ${p.hp}/${p.max_hp} Item: ${p.held_item} Nature: ${p.nature} Ability: ${p.ability}\n`;
                    systemPrompt += `  Moves: ${p.moves.map(m => m.name).join(", ")}\n`;
                    if (mode === 'battle') {
                        systemPrompt += `  Stats: Atk ${p.stats.attack}, Def ${p.stats.defence}, SpA ${p.stats.special_attack}, SpD ${p.stats.special_defence}, Spe ${p.stats.speed}\n`;
                    }
                });
                systemPrompt += "\n";
            }

            // PC Data (Only for General Mode)
            if (mode === 'general' && context.pc && context.pc.length > 0) {
                systemPrompt += `PC SYSTEM (${context.pc.length} Pokémon):\n`;
                // Limit to avoid token overflow, maybe summarize or list first 50?
                // For now, listing all might be too much if user has hundreds. Let's list simplified info.
                context.pc.forEach(p => {
                    systemPrompt += `- ${p.species} (Lvl ${p.level}) ${p.shiny ? "✨" : ""} ${p.gender} IVs: ${Math.floor((p.ivs.hp + p.ivs.attack + p.ivs.defence + p.ivs.special_attack + p.ivs.special_defence + p.ivs.speed) / 186 * 100)}%\n`;
                });
                systemPrompt += "\n";
            }

            // Nearby Data (Contextual)
            if (context.nearby && context.nearby.length > 0) {
                systemPrompt += "POKÉMONS PRÓXIMOS:\n";
                context.nearby.slice(0, 5).forEach(p => {
                    systemPrompt += `- ${p.species} (Lvl ${p.level}) ${p.shiny ? "✨SHINY✨" : ""} ${p.is_legendary ? "👑LENDÁRIO👑" : ""}\n`;
                });
                systemPrompt += "\n";
            }

            // Start chat with history
            const chat = model.startChat({
                history: [
                    {
                        role: "user",
                        parts: [{ text: systemPrompt }],
                    },
                    {
                        role: "model",
                        parts: [{ text: `Entendido. Modo ${mode === 'battle' ? 'BATALHA' : 'GERAL'} ativado.` }],
                    },
                    ...history.map(msg => ({
                        role: msg.role,
                        parts: [{ text: msg.text }],
                    })),
                ],
            });

            const result = await chat.sendMessage(message);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error("Erro ao chamar Gemini:", error);
            throw error;
        }
    },
};
