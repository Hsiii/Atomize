import { ArrowLeft } from "lucide-react";
import { uiText } from "../app-state";

type BackButtonProps = {
  onBack: () => void | Promise<void>;
};

export function BackButton({ onBack }: BackButtonProps) {
  return (
    <button
      type="button"
      className="icon-action floating-back-button"
      onClick={() => void onBack()}
      aria-label={uiText.back}
    >
      <ArrowLeft className="control-icon" aria-hidden="true" />
    </button>
  );
}