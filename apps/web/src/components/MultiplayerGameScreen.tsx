import { Delete, Swords } from "lucide-react";
import type { Prime, RoomPlayer, RoomSnapshot } from "@atomize/game-core";
import { ActionButton } from "./ActionButton";
import { BackButton } from "./BackButton";
import { ScoreDialog } from "./ScoreDialog";
import { uiText } from "../app-state";

type MultiplayerGameScreenProps = {
  playablePrimes: Prime[];
  multiplayerTimeLeft: number;
  multiplayerCountdownProgress: number;
  multiplayerScore: number;
  currentMultiplayerPlayer: RoomPlayer | null;
  multiplayerSnapshot: RoomSnapshot | null;
  multiplayerPrimeQueue: Prime[];
  isMultiplayerInputDisabled: boolean;
  isMultiplayerComboRunning: boolean;
  roomId: string;
  onBack: () => void | Promise<void>;
  onPrimeTap: (prime: Prime) => void;
  onBackspace: () => void;
  onSubmit: () => void | Promise<void>;
  formatCountdown: (totalSeconds: number) => string;
};

export function MultiplayerGameScreen({
  playablePrimes,
  multiplayerTimeLeft,
  multiplayerCountdownProgress,
  multiplayerScore,
  currentMultiplayerPlayer,
  multiplayerSnapshot,
  multiplayerPrimeQueue,
  isMultiplayerInputDisabled,
  isMultiplayerComboRunning,
  roomId,
  onBack,
  onPrimeTap,
  onBackspace,
  onSubmit,
  formatCountdown,
}: MultiplayerGameScreenProps) {
  const isTimeUp = multiplayerTimeLeft === 0;

  return (
    <main className="app-shell fullscreen-shell">
      <BackButton onBack={onBack} />
      <section className="screen game-screen single-game-screen multiplayer-game-screen">
        <header className="top-bar single-top-bar multiplayer-top-bar">
          <div className="single-timer-shell" aria-label={`${uiText.timer}: ${formatCountdown(multiplayerTimeLeft)}`}>
            <div className="single-timer-bar">
              <span
                className="single-timer-fill"
                style={{ width: `${multiplayerCountdownProgress}%` }}
              />
            </div>
            <span className="single-timer-text">{formatCountdown(multiplayerTimeLeft)}</span>
          </div>

          <div
            className="single-score-pill multiplayer-score-pill"
            aria-label={`${uiText.score}: ${multiplayerScore}`}
          >
            <span className="single-score-label">{uiText.score}</span>
            <strong>{multiplayerScore}</strong>
          </div>
        </header>

        <section className="single-value-display multiplayer-value-display" aria-live="polite">
          <strong>{currentMultiplayerPlayer?.stage.remainingValue ?? "--"}</strong>
        </section>

        <section className="combo-panel" aria-live="polite">
          <div className="combo-bar">
            {multiplayerPrimeQueue.length > 0 ? multiplayerPrimeQueue.join(" x ") : null}
          </div>
        </section>

        <section className="single-controls-grid multiplayer-controls-grid">
          <div className="keypad solo-keypad multiplayer-keypad">
            {playablePrimes.map((prime) => (
              <button
                key={`room-${prime}`}
                type="button"
                onClick={() => onPrimeTap(prime)}
                disabled={isMultiplayerInputDisabled}
              >
                {prime}
              </button>
            ))}
          </div>

          <div className="combo-actions-column">
            <ActionButton
              variant="secondary"
              className="combo-backspace-button"
              onClick={onBackspace}
              disabled={isMultiplayerComboRunning || multiplayerPrimeQueue.length === 0}
              aria-label={uiText.backspace}
            >
              <Delete className="control-icon" aria-hidden="true" />
            </ActionButton>

            <ActionButton
              variant="secondary"
              className="combo-enter-button"
              onClick={() => void onSubmit()}
              disabled={isMultiplayerInputDisabled || multiplayerPrimeQueue.length === 0}
              aria-label={uiText.enterCombo}
            >
              <Swords className="control-icon" aria-hidden="true" />
            </ActionButton>
          </div>
        </section>

        {isTimeUp ? <ScoreDialog score={multiplayerScore} onReturnHome={onBack} /> : null}
      </section>
    </main>
  );
}
