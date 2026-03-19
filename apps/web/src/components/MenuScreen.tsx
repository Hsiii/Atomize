import { ActionButton } from "./ActionButton";
import { uiText } from "../app-state";

type MenuScreenProps = {
  onStartSingleGame: () => void;
  onStartCreateRoomFlow: () => void;
  onStartJoinRoomFlow: () => void;
};

export function MenuScreen({ onStartSingleGame, onStartCreateRoomFlow, onStartJoinRoomFlow }: MenuScreenProps) {
  return (
    <main className="app-shell fullscreen-shell">
      <section className="screen screen-menu">
        <div className="menu-stack">
          <p className="eyebrow">{uiText.eyebrow}</p>
          <h1 className="hero-title">{uiText.title}</h1>
          <div className="action-stack menu-actions">
            <ActionButton variant="primary" onClick={onStartSingleGame}>
              {uiText.singlePlayer}
            </ActionButton>
            <ActionButton variant="secondary" onClick={onStartCreateRoomFlow}>
              {uiText.createRoom}
            </ActionButton>
            <ActionButton variant="secondary" onClick={onStartJoinRoomFlow}>
              {uiText.joinRoom}
            </ActionButton>
          </div>
        </div>
      </section>
    </main>
  );
}
