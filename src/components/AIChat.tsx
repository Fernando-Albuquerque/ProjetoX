import { useState, useEffect, useRef } from 'react';
import { Send, Bot, Key, Trash2 } from 'lucide-react';
import { geminiService } from '../services/gemini';
import type { ChatMessage, GameContext } from '../services/gemini';

interface AIChatProps {
    context: GameContext;
    apiKey: string;
    setApiKey: (key: string) => void;
}

export default function AIChat({ context, apiKey, setApiKey }: AIChatProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [aiMode, setAiMode] = useState<'battle' | 'general'>('battle');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || !apiKey) return;

        const userMsg: ChatMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const responseText = await geminiService.sendMessage(apiKey, messages, userMsg.text, context, aiMode);
            const botMsg: ChatMessage = { role: 'model', text: responseText };
            setMessages(prev => [...prev, botMsg]);
        } catch (error: any) {
            console.error("Chat error:", error);
            const errorMessage = error.message || "Erro desconhecido";
            setMessages(prev => [...prev, { role: 'model', text: `❌ Erro: ${errorMessage}` }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!apiKey) {
        return (
            <div className="glass-panel" style={{ padding: '30px', textAlign: 'center' }}>
                <Bot size={48} style={{ marginBottom: '20px', color: 'var(--primary)' }} />
                <h2>Configurar Gemini AI</h2>
                <p style={{ marginBottom: '20px', color: '#ccc' }}>
                    Para usar o assistente de batalha, você precisa de uma API Key do Google Gemini.
                </p>
                <div style={{ display: 'flex', gap: '10px', maxWidth: '400px', margin: '0 auto' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Key size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
                        <input
                            type="password"
                            placeholder="Cole sua API Key aqui..."
                            style={{
                                width: '100%',
                                padding: '10px 10px 10px 35px',
                                borderRadius: '6px',
                                border: '1px solid rgba(255,255,255,0.2)',
                                background: 'rgba(0,0,0,0.3)',
                                color: 'white'
                            }}
                            onChange={(e) => setApiKey(e.target.value)}
                        />
                    </div>
                </div>
                <p style={{ fontSize: '0.8rem', marginTop: '20px', color: '#888' }}>
                    Sua chave é salva apenas no seu navegador.
                </p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: '500px' }}>
            {/* Header */}
            <div style={{
                padding: '10px',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Bot size={20} color="var(--primary)" />
                    <span style={{ fontWeight: 'bold' }}>Gemini Assistant</span>
                </div>

                {/* Mode Switcher */}
                <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', padding: '2px' }}>
                    <button
                        onClick={() => setAiMode('battle')}
                        style={{
                            background: aiMode === 'battle' ? 'var(--primary)' : 'transparent',
                            color: aiMode === 'battle' ? 'white' : '#aaa',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            fontWeight: aiMode === 'battle' ? 'bold' : 'normal'
                        }}
                    >
                        Batalha
                    </button>
                    <button
                        onClick={() => setAiMode('general')}
                        style={{
                            background: aiMode === 'general' ? 'var(--primary)' : 'transparent',
                            color: aiMode === 'general' ? 'white' : '#aaa',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            fontWeight: aiMode === 'general' ? 'bold' : 'normal'
                        }}
                    >
                        Geral
                    </button>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={() => setApiKey('')}
                        title="Alterar API Key"
                        style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer' }}
                    >
                        <Key size={16} />
                    </button>
                    <button
                        onClick={() => setMessages([])}
                        title="Limpar conversa"
                        style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer' }}
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '15px',
                display: 'flex',
                flexDirection: 'column',
                gap: '15px'
            }}>
                {messages.length === 0 && (
                    <div style={{ textAlign: 'center', color: '#888', marginTop: '20px' }}>
                        <p>Olá! Eu tenho acesso aos dados do seu jogo.</p>
                        <p>Modo atual: <strong>{aiMode === 'battle' ? 'Assistente de Batalha' : 'Assistente Geral'}</strong></p>
                        <p style={{ fontSize: '0.9rem' }}>
                            {aiMode === 'battle'
                                ? 'Focado em táticas de combate e análise de oponentes.'
                                : 'Acesso ao seu PC e Party para gerenciamento e dicas.'}
                        </p>
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <div key={idx} style={{
                        alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        maxWidth: '85%',
                        background: msg.role === 'user' ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                        color: 'white',
                        padding: '10px 14px',
                        borderRadius: '12px',
                        borderBottomRightRadius: msg.role === 'user' ? '2px' : '12px',
                        borderBottomLeftRadius: msg.role === 'model' ? '2px' : '12px',
                        lineHeight: '1.4'
                    }}>
                        <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
                    </div>
                ))}

                {isLoading && (
                    <div style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '12px' }}>
                        <span className="animate-pulse">Digitando...</span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{ padding: '10px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={`Pergunte ao assistente ${aiMode === 'battle' ? 'de batalha' : 'geral'}...`}
                        disabled={isLoading}
                        style={{
                            flex: 1,
                            padding: '10px',
                            borderRadius: '6px',
                            border: '1px solid rgba(255,255,255,0.2)',
                            background: 'rgba(0,0,0,0.3)',
                            color: 'white'
                        }}
                    />
                    <button
                        onClick={handleSend}
                        disabled={isLoading || !input.trim()}
                        style={{
                            background: 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '0 15px',
                            cursor: 'pointer',
                            opacity: (isLoading || !input.trim()) ? 0.5 : 1
                        }}
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
