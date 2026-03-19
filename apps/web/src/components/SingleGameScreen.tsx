import { ArrowLeft, Delete, Swords } from "lucide-react";
import type { Prime, SoloState } from "@atomize/game-core";
import { ActionButton } from "./ActionButton";
import { uiText } from "../app-state";

type SingleGameScreenProps = {
  playablePrimes: Prime[];
  soloState: SoloState;
  soloTimeLeft: number;
  soloCountdownProgress: number;
  soloPrimeQueue: Prime[];
  isSoloComboRunning: boolean;
  soloTimerPenaltyPopKey: number;
  onBack: () => void | Promise<void>;
  onPrimeTap: (prime: Prime) => void;
  onBackspace: () => void;
  onSubmit: () => void;
  formatCountdown: (totalSeconds: number) => string;
};

export function SingleGameScreen({
  playablePrimes,
  soloState,
  soloTimeLeft,
  soloCountdownProgress,
  soloPrimeQueue,
  isSoloComboRunning,
  soloTimerPenaltyPopKey,
  onBack,
  onPrimeTap,
  onBackspace,
  onSubmit,
  formatCountdown,
}: SingleGameScreenProps) {
  return (
    <main className="app-shell fullscreen-shell">
      <section className="screen game-screen single-game-screen">
        <header className="top-bar single-top-bar">
          <button
            type="button"
            className="icon-action"
            onClick={() => void onBack()}
            aria-label={uiText.back}
          >
            <ArrowLeft className="control-icon" aria-hidden="true" />
          </button>

          <div className="single-timer-shell" aria-label={`${uiText.timer}: ${formatCountdown(soloTimeLeft)}`}>
            <div className="single-timer-bar">
              <span
                className="single-timer-fill"
                style={{ width: `${soloCountdownProgress}%` }}
              />
            </div>
            <span className="single-timer-text">{formatCountdown(soloTimeLeft)}</span>
            {soloTimerPenaltyPopKey > 0 ? (
              <span key={soloTimerPenaltyPopKey} className="single-timer-penalty" aria-hidden="true">
                -1s
              </span>
            ) : null}
          </div>

          <div className="single-score-pill" aria-label={`${uiText.score}: ${soloState.score}`}>
            <span className="single-score-label">{uiText.score}</span>
            <strong>{soloState.score}</strong>
          </div>
        </header>

        <section className="single-value-display" aria-live="polite">
          <strong>{soloState.currentStage.remainingValue}</strong>
        </section>

        <section className="combo-panel" aria-live="polite">
          <div className="combo-bar">
            {soloPrimeQueue.length > 0 ? soloPrimeQueue.join(" x ") : null}
          </div>
        </section>

        <section className="single-controls-grid">
          <div className="keypad solo-keypad">
            {playablePrimes.map((prime) => (
              <button
                key={prime}
                type="button"
                onClick={() => onPrimeTap(prime)}
                disabled={soloTimeLeft === 0 || isSoloComboRunning}
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
              disabled={soloPrimeQueue.length === 0 || isSoloComboRunning}
              aria-label={uiText.backspace}
            >
              <Delete className="control-icon" aria-hidden="true" />
            </ActionButton>

            <ActionButton
              variant="secondary"
              className="combo-enter-button"
              onClick={onSubmit}
              disabled={soloTimeLeft === 0 || soloPrimeQueue.length === 0 || isSoloComboRunning}
              aria-label={uiText.enterCombo}
            >
              <Swords className="control-icon" aria-hidden="true" />
            </ActionButton>
          </div>
        </section>
      </section>
    </main>
  );
}
