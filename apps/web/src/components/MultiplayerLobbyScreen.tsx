import { useEffect, useState } from "react";
import { ActionButton } from "./ActionButton";
import { BackButton } from "./BackButton";
import { RoomCodePanel } from "./RoomCodePanel";
import type { MenuMode, MultiplayerState } from "../app-state";
import { uiText } from "../app-state";

type MultiplayerLobbyScreenProps = {
  menuMode: MenuMode;
  multiplayer: MultiplayerState;
  multiplayerCountdownValue: number | null;
  transientToastId: number;
  transientToastMessage: string | null;
  isJoinPending: boolean;
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
  transientToastId,
  transientToastMessage,
  isJoinPending,
  roomIdInput,
  onBack,
  onRoomIdInputChange,
  onJoinRoom,
  onCreateRoom,
  onGuestReady,
  onHostStart,
  canStartRoomCountdown,
}: MultiplayerLobbyScreenProps) {
  const [localToastMessage, setLocalToastMessage] = useState<string | null>(null);
  const [visibleTransientToastMessage, setVisibleTransientToastMessage] = useState<string | null>(null);
  const isJoinFlow = menuMode === "join-room";
  const shouldShowWaitingRoom = Boolean(multiplayer.roomId);
  const isJoinButtonReady = roomIdInput.length === 4;
  const isJoinButtonDisabled = isJoinPending || !isJoinButtonReady;
  const activeToastMessage = localToastMessage ?? visibleTransientToastMessage;

  useEffect(() => {
    if (!localToastMessage) {
      return;
    }

    const timer = window.setTimeout(() => {
      setLocalToastMessage(null);
    }, 2200);

    return () => {
      window.clearTimeout(timer);
    };
  }, [localToastMessage]);

  useEffect(() => {
    if (!transientToastMessage) {
      setVisibleTransientToastMessage(null);
      return;
    }

    setVisibleTransientToastMessage(transientToastMessage);

    const timer = window.setTimeout(() => {
      setVisibleTransientToastMessage(null);
    }, 2200);

    return () => {
      window.clearTimeout(timer);
    };
  }, [transientToastId, transientToastMessage]);

  function handleCreateOrJoinClick() {
    if (!isJoinFlow) {
      void onCreateRoom();
      return;
    }

    if (!isJoinButtonReady) {
      setLocalToastMessage(uiText.joinIncompleteToast);
      return;
    }

    if (isJoinPending) {
      return;
    }

    void onJoinRoom();
  }

  if (!multiplayer.roomId && !shouldShowWaitingRoom) {
    return (
      <main className="app-shell fullscreen-shell">
        <BackButton onBack={onBack} />
        <section className="screen lobby-screen">
          <div className="lobby-stack waiting-room-stack">
            <RoomCodePanel value={roomIdInput} editable onChange={onRoomIdInputChange} />

            <div className="waiting-cta">
              <ActionButton
                variant="secondary"
                className={isJoinFlow && isJoinButtonDisabled ? "start-action is-disabled" : "start-action"}
                onClick={handleCreateOrJoinClick}
                aria-disabled={isJoinFlow && isJoinButtonDisabled}
              >
                {isJoinFlow ? (isJoinPending ? uiText.findingRoom : uiText.go) : uiText.createRoom}
              </ActionButton>
            </div>

            {activeToastMessage ? (
              <div className="waiting-toast-layer" aria-live="polite">
                <div className="waiting-toast">{activeToastMessage}</div>
              </div>
            ) : null}
          </div>
        </section>
      </main>
    );
  }

  const currentPlayer = multiplayer.snapshot?.players.find((player) => player.id === multiplayer.playerId) ?? null;
  const opponentPlayer = multiplayer.snapshot?.players.find((player) => player.id !== multiplayer.playerId) ?? null;
  const isCountdown = multiplayer.snapshot?.status === "countdown";
  const readyButtonDisabled = !currentPlayer || isCountdown;
  const guestButtonText = currentPlayer?.ready
    ? `${uiText.readyWaiting} ${opponentPlayer?.name ?? uiText.opponent}`
    : uiText.ready;

  function handleHostStartClick() {
    if (!canStartRoomCountdown) {
      setLocalToastMessage(uiText.startBlockedToast);
      return;
    }

    void onHostStart();
  }

  return (
    <main className="app-shell fullscreen-shell">
      <BackButton onBack={onBack} />
      <section className="screen lobby-screen">
        <div className="lobby-stack waiting-room-stack">
          <RoomCodePanel value={multiplayer.roomId} />

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
              <ActionButton variant="secondary" className="start-action" disabled>
                {`${uiText.countdownPrefix} ${multiplayerCountdownValue ?? 3}`}
              </ActionButton>
            ) : multiplayer.isHost ? (
              <ActionButton
                variant="secondary"
                className={!canStartRoomCountdown ? "start-action is-disabled" : "start-action"}
                onClick={handleHostStartClick}
                aria-disabled={!canStartRoomCountdown}
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
          </div>

          {activeToastMessage ? (
            <div className="waiting-toast-layer" aria-live="polite">
              <div className="waiting-toast">{activeToastMessage}</div>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
