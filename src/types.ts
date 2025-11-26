export interface Stats {
    hp: number;
    attack: number;
    defence: number;
    special_attack: number;
    special_defence: number;
    speed: number;
}

export interface Move {
    name: string;
    type: string;
    category: string;
    power: number;
    accuracy: number;
    pp: number;
    max_pp: number;
}

export interface Pokemon {
    species: string;
    level: number;
    hp: number;
    max_hp: number;
    gender: string;
    shiny: boolean;
    is_legendary: boolean;
    is_mythical: boolean;
    is_ultra_beast: boolean;
    friendship: number;
    experience: number;
    nature: string;
    ability: string;
    held_item: string;
    ball: string;
    original_trainer: string;
    status: string;

    ivs: Stats;
    evs: Stats;
    stats: Stats;

    moves: Move[];

    // Coordinates for nearby pokemon
    x?: number;
    y?: number;
    z?: number;
}

export interface BattleActor {
    name: string;
    side: string;
    pokemon: Pokemon[];
}

export interface BattleData {
    status: "active" | "no_battle";
    battle_id?: string;
    actors?: BattleActor[];
    error?: string;
}

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
