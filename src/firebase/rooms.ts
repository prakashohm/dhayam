/**
 * firebase/rooms.ts
 * Firebase Realtime Database room management.
 * Handles: create room, join room, subscribe to room state, push moves, disconnect handling.
 */

import {
  ref,
  set,
  get,
  update,
  onValue,
  onDisconnect,
  off,
  DataSnapshot,
  Unsubscribe,
} from 'firebase/database';
import { getFirebaseDB } from './init';
import { GameState } from '../engine/gameEngine';

export interface RoomPlayer {
  id: string;
  name: string;
  playerIndex: number;
  connected: boolean;
}

export interface Room {
  code: string;
  hostId: string;
  players: RoomPlayer[];
  gameState: GameState | null;
  status: 'waiting' | 'playing' | 'finished';
  createdAt: number;
}

/** Generate a random 6-character room code */
function generateCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

/** Create a new room and return the code */
export async function createRoom(hostPlayer: RoomPlayer): Promise<string> {
  const db = getFirebaseDB();
  const code = generateCode();
  const room: Room = {
    code,
    hostId: hostPlayer.id,
    players: [hostPlayer],
    gameState: null,
    status: 'waiting',
    createdAt: Date.now(),
  };

  await set(ref(db, `rooms/${code}`), room);

  // Disconnect handling for host
  const connRef = ref(db, `rooms/${code}/players/0/connected`);
  onDisconnect(connRef).set(false);

  return code;
}

/** Join an existing room */
export async function joinRoom(code: string, player: RoomPlayer): Promise<Room | null> {
  const db = getFirebaseDB();
  const roomRef = ref(db, `rooms/${code.toUpperCase()}`);
  const snapshot = await get(roomRef);

  if (!snapshot.exists()) return null;

  const room: Room = snapshot.val();
  if (room.status !== 'waiting') return null;
  if (room.players.length >= 4) return null;

  const playerIndex = room.players.length;
  const updatedPlayer = { ...player, playerIndex };
  const updatedPlayers = [...room.players, updatedPlayer];

  await update(roomRef, { players: updatedPlayers });

  // Disconnect handling
  const connRef = ref(db, `rooms/${code.toUpperCase()}/players/${playerIndex}/connected`);
  onDisconnect(connRef).set(false);

  return { ...room, players: updatedPlayers };
}

/** Subscribe to real-time room updates */
export function subscribeToRoom(
  code: string,
  callback: (room: Room) => void
): Unsubscribe {
  const db = getFirebaseDB();
  const roomRef = ref(db, `rooms/${code.toUpperCase()}`);
  const unsubscribe = onValue(roomRef, (snapshot: DataSnapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val() as Room);
    }
  });
  return () => off(roomRef, 'value');
}

/** Push a new game state to Firebase (only the authoritative player does this) */
export async function pushGameState(code: string, gameState: GameState): Promise<void> {
  const db = getFirebaseDB();
  await update(ref(db, `rooms/${code.toUpperCase()}`), { gameState });
}

/** Start the game (host only) */
export async function startGame(code: string, gameState: GameState): Promise<void> {
  const db = getFirebaseDB();
  await update(ref(db, `rooms/${code.toUpperCase()}`), {
    gameState,
    status: 'playing',
  });
}

/** Generate a shareable invite link */
export function getInviteLink(code: string): string {
  const base =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://dhayam.netlify.app';
  return `${base}/?room=${code.toUpperCase()}`;
}
