import { ArrowLeft } from "lucide-react";
import type { ChangeEvent } from "react";
import { ActionButton } from "./ActionButton";
import type { MenuMode, MultiplayerState } from "../app-state";
import { uiText } from "../app-state";

type MultiplayerLobbyScreenProps = {
  menuMode: MenuMode;
  multiplayer: MultiplayerState;
  multiplayerCountdownValue: number | null;
  roomIdInput: string;
  onBack: () => void | Promise<void>;
  onRoomIdInputChange: (value: string) => void;
  onJoinRoom: () => void | Promise<void>;
  onCreateRoom: () => void | Promise<void>;
  onGuestReady: () => void | Promise<void>;
  onHostStart: () => void | Promise<void>;
  canStartRoomCountdown: boolean;
};

export function MultiplayerLobbyScreen({
  menuMode,
  multiplayer,
  multiplayerCountdownValue,
  roomIdInput,
  onBack,
  onRoomIdInputChange,
  onJoinRoom,
  onCreateRoom,
  onGuestReady,
  onHostStart,
  canStartRoomCountdown,
}: MultiplayerLobbyScreenProps) {
  const isJoinFlow = menuMode === "join-room";
  const shouldShowWaitingRoom = Boolean(multiplayer.roomId);

  if (!multiplayer.roomId && !shouldShowWaitingRoom) {
    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
      onRoomIdInputChange(event.target.value);
    };

    return (
      <main className="app-shell fullscreen-shell">
        <section className="screen lobby-screen">
          <header className="top-bar">
            <button
              type="button"
              className="icon-action"
              onClick={() => void onBack()}
              aria-label={uiText.back}
            >
              <ArrowLeft className="control-icon" aria-hidden="true" />
            </button>
          </header>

          <div className="lobby-stack waiting-room-stack">
            <label className="code-panel waiting-code-panel room-code-input-panel">
              <p className="label">{uiText.roomCode}</p>
              <input
                className="room-code-block-input"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                value={roomIdInput}
                onChange={handleInputChange}
                placeholder={uiText.roomPlaceholder}
                aria-label={uiText.enterCode}
              />
            </label>

            <div className="waiting-cta">
              <ActionButton variant="secondary" onClick={() => void (isJoinFlow ? onJoinRoom() : onCreateRoom())}>
                {isJoinFlow ? uiText.go : uiText.createRoom}
              </ActionButton>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const currentPlayer = multiplayer.snapshot?.players.find((player) => player.id === multiplayer.playerId) ?? null;
  const opponentPlayer = multiplayer.snapshot?.players.find((player) => player.id !== multiplayer.playerId) ?? null;
  const isCountdown = multiplayer.snapshot?.status === "countdown";
  const readyButtonDisabled = !currentPlayer || currentPlayer.ready || isCountdown;
  const isHostBlocked = multiplayer.isHost && !isCountdown && !canStartRoomCountdown;
  const guestButtonText = currentPlayer?.ready
    ? `${uiText.readyWaiting} ${opponentPlayer?.name ?? uiText.opponent}`
    : uiText.ready;

  return (
    <main className="app-shell fullscreen-shell">
      <section className="screen lobby-screen">
        <header className="top-bar">
          <button
            type="button"
            className="icon-action"
            onClick={() => void onBack()}
            aria-label={uiText.back}
          >
            <ArrowLeft className="control-icon" aria-hidden="true" />
          </button>
        </header>

        <div className="lobby-stack waiting-room-stack">
          <div className="code-panel waiting-code-panel">
            <p className="label">{uiText.roomCode}</p>
            <strong>{multiplayer.roomId || uiText.roomPlaceholder}</strong>
          </div>

          <section className="scoreboard player-scoreboard lobby-scoreboard waiting-room-grid">
            <div className="player-card waiting-player-card active">
              <p className="label">YOU</p>
              <strong>{currentPlayer?.name ?? "-"}</strong>
            </div>

            {opponentPlayer ? (
              <div className="player-card waiting-player-card">
                <p className="label">OPPONENT</p>
                <strong>{opponentPlayer.name}</strong>
                {opponentPlayer.ready ? <span className="waiting-ready-badge">{uiText.readyBadge}</span> : null}
              </div>
            ) : (
              <div className="player-card waiting-player-card waiting-placeholder-card">
                <p className="label">OPPONENT</p>
                <div className="waiting-placeholder-mark" aria-hidden="true">
                  ?
                </div>
              </div>
            )}
          </section>

          <div className="waiting-cta">
            {isCountdown ? (
              <ActionButton variant="primary" className="start-action" disabled>
                {`${uiText.countdownPrefix} ${multiplayerCountdownValue ?? 3}`}
              </ActionButton>
            ) : multiplayer.isHost ? (
              <ActionButton
                variant="primary"
                className="start-action"
                onClick={() => void onHostStart()}
                disabled={!canStartRoomCountdown}
              >
                {uiText.start}
              </ActionButton>
            ) : (
              <ActionButton
                variant="secondary"
                className="start-action"
                onClick={() => void onGuestReady()}
                disabled={readyButtonDisabled}
              >
                {guestButtonText}
              </ActionButton>
            )}

            {isHostBlocked ? <div className="waiting-toast">{uiText.startBlockedToast}</div> : null}
          </div>
        </div>
      </section>
    </main>
  );
}
