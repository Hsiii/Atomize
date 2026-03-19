import { ActionButton } from "./ActionButton";
import { uiText } from "../app-state";

type ScoreDialogProps = {
  score: number;
  onReturnHome: () => void | Promise<void>;
};

export function ScoreDialog({ score, onReturnHome }: ScoreDialogProps) {
  return (
    <div className="score-dialog-scrim" role="presentation">
      <section
        className="score-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="score-dialog-title"
      >
        <span id="score-dialog-title" className="label">
          {uiText.score}
        </span>
        <strong>{score}</strong>
        <ActionButton variant="primary" onClick={() => void onReturnHome()}>
          {uiText.returnHome}
        </ActionButton>
      </section>
    </div>
  );
}