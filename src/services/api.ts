

const API_BASE = '/api';
const USE_MOCK_DATA = false; // Set to false for real data

export interface PlayerData {
  name: string;
  health: number;
  max_health: number;
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch: number;
  dimension: string;
}

export interface Pokemon {
  species: string;
  level: number;
  hp: number;
  max_hp: number;
  gender: 'MALE' | 'FEMALE' | 'UNKNOWN';
  shiny: boolean;
  x?: number;
  y?: number;
  z?: number;
}

// Mock Data Generators
const mockPlayer: PlayerData = {
  name: "DevPlayer",
  health: 18.5,
  max_health: 20.0,
  x: 100.5,
  y: 64.0,
  z: -200.5,
  yaw: 45.0, // Facing North-East
  pitch: 0.0,
  dimension: "minecraft:overworld"
};

const mockParty: Pokemon[] = [
  { species: "Charizard", level: 36, hp: 120, max_hp: 120, gender: "MALE", shiny: false },
  { species: "Pikachu", level: 5, hp: 20, max_hp: 20, gender: "FEMALE", shiny: true },
  { species: "Gengar", level: 42, hp: 0, max_hp: 110, gender: "MALE", shiny: false },
];

const mockNearby: Pokemon[] = [
  { species: "Zubat", level: 10, hp: 30, max_hp: 30, gender: "MALE", shiny: false, x: 105.2, y: 65.0, z: -198.3 },
  { species: "Geodude", level: 12, hp: 40, max_hp: 40, gender: "FEMALE", shiny: false, x: 110.0, y: 64.0, z: -205.1 },
  { species: "Onix", level: 15, hp: 60, max_hp: 60, gender: "MALE", shiny: false, x: 90.0, y: 64.0, z: -210.0 },
  { species: "Shiny Magikarp", level: 5, hp: 15, max_hp: 15, gender: "MALE", shiny: true, x: 100.0, y: 63.0, z: -190.0 },
];

// Fix JSON with commas as decimal separators (Brazilian locale issue)
function fixBrazilianJSON(text: string): string {
  // Replace commas with dots in numeric values like "20,5" -> "20.5"
  // This regex matches patterns like ":20,5" or ":20,0" and replaces the comma with a dot
  return text.replace(/":(-?\d+),(\d+)/g, '":$1.$2');
}

// Helper function with timeout
async function fetchWithTimeout(url: string, timeout = 5000) {
  console.log(`[API] Fetching ${url}...`);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Get text first, fix Brazilian decimal commas, then parse
    const text = await response.text();
    console.log(`[API] Raw response:`, text);

    const fixedText = fixBrazilianJSON(text);
    if (text !== fixedText) {
      console.log(`[API] Fixed JSON:`, fixedText);
    }

    const data = JSON.parse(fixedText);
    console.log(`[API] Success:`, data);
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      console.error(`[API] Timeout ao buscar ${url}`);
      throw new Error('Timeout: Servidor não respondeu. Verifique se o mod está rodando.');
    }
    console.error(`[API] Erro ao buscar ${url}:`, error);
    throw error;
  }
}

export const api = {
  getPlayer: async (): Promise<PlayerData> => {
    if (USE_MOCK_DATA) return Promise.resolve(mockPlayer);
    return fetchWithTimeout(`${API_BASE}/player`);
  },
  getParty: async (): Promise<Pokemon[]> => {
    if (USE_MOCK_DATA) return Promise.resolve(mockParty);
    return fetchWithTimeout(`${API_BASE}/party`);
  },
  getNearby: async (): Promise<Pokemon[]> => {
    if (USE_MOCK_DATA) return Promise.resolve(mockNearby);
    return fetchWithTimeout(`${API_BASE}/nearby`);
  }
};
