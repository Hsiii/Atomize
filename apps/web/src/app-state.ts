import type { RoomSnapshot } from "@atomize/game-core";

export const uiText = {
  back: "Back",
  timer: "Time",
  score: "Score",
  returnHome: "Return Home",
  health: "HP",
  combo: "Combo",
  you: "You",
  opponent: "Opponent",
  battle: "Battle",
  serverOnline: "Server online",
  serverOffline: "Server offline",
  title: "Atomize",
  eyebrow: "Prime factor battle",
  singlePlayer: "Single Player",
  multiPlayer: "Multi Player",
  createRoom: "Create Room",
  joinRoom: "Join Room",
  settings: "Settings",
  playerName: "Player Name",
  saveName: "Save",
  randomName: "Randomize",
  close: "Close",
  namePlaceholder: "Enter your name",
  go: "Go!",
  roomCode: "Room Code",
  enterCode: "Enter Code",
  backspace: "Backspace",
  enterCombo: "Enter",
  ready: "Ready",
  readyWaiting: "Waiting for",
  waitingForHost: "Waiting for host to start.",
  opponentMustReady: "Opponent must press ready first.",
  pressReady: "Press ready when you are set.",
  readyBadge: "READY!",
  startBlockedToast: "Opponent isn't ready yet, so we can't start.",
  joinIncompleteToast: "Enter the full 4-digit room code first.",
  joinMissingRoomToast: "That room doesn't exist.",
  findingRoom: "Finding Room...",
  countdownPrefix: "Starting in",
  joiningRoom: "Joining room...",
  start: "Start",
  roomHint: "Tap create to open a room, or join with a 4-digit code.",
  configHint: "Server setup required for multiplayer.",
  idleStatus: "Server idle",
  roomPlaceholder: "0000",
  openingRoom: "Opening room...",
  waitingForPlayer: "Waiting for the second player to join.",
} as const;

export type MenuMode = "default" | "create-room" | "join-room";
export type Screen = "menu" | "single" | "multi-lobby" | "multi-game";

export type MultiplayerState = {
  playerId: string | null;
  snapshot: RoomSnapshot | null;
  statusText: string;
  roomId: string;
  isHost: boolean;
};
