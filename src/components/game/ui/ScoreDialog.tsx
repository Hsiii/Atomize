import type { JSX } from 'react';

import { uiText } from '../../../app-state';

import './ScoreDialog.css';

import { ActionButton } from './ActionButton';
import { ConfettiLayer } from './ConfettiLayer';

/* Types */

type PlayerStats = {
    name: string;
    maxCombo: number;
    atomized: number;
    isWinner: boolean;
};

type SoloScoreDialogProps = {
    mode: 'solo';
    score: number;
    atomized: number;
    comboCount: number;
    bestScore?: number;
    isNewBest?: boolean;
    onRetry?: () => void;
    onReturnHome: () => void | Promise<void>;
    title: string;
};

type BattleScoreDialogProps = {
    mode: 'battle';
    currentPlayer: PlayerStats;
    opponent: PlayerStats;
    onRematch?: () => void;
    onReturnHome: () => void | Promise<void>;
    title: string;
};

type ScoreDialogProps = SoloScoreDialogProps | BattleScoreDialogProps;

/* Component */

export function ScoreDialog(props: ScoreDialogProps): JSX.Element {
    const { title, onReturnHome } = props;
    const isVictory = title === uiText.victory;
    const isDefeat = title === uiText.defeat;

    function handleReturnHomeClick() {
        Promise.resolve(onReturnHome()).catch(() => undefined);
    }

    let variantClass = '';

    if (isVictory) {
        variantClass = ' score-dialog--victory';
    } else if (isDefeat) {
        variantClass = ' score-dialog--defeat';
    }
    const modeClass = props.mode === 'battle' ? ' score-dialog--battle' : '';

    return (
        <div className='score-dialog-scrim' role='presentation'>
            {isVictory ? <ConfettiLayer /> : undefined}
            <section
                aria-labelledby='score-dialog-title'
                aria-modal='true'
                className={`score-dialog${variantClass}${modeClass}`}
                role='dialog'
            >
                <header className='score-dialog-header'>
                    <span
                        className='score-dialog-title'
                        id='score-dialog-title'
                    >
                        {title}
                    </span>
                </header>

                {props.mode === 'battle' ? (
                    <div className='score-dialog-players'>
                        <PlayerColumn player={props.currentPlayer} />
                        <div
                            aria-hidden='true'
                            className='score-dialog-player-divider'
                        />
                        <PlayerColumn player={props.opponent} />
                    </div>
                ) : (
                    <>
                        <div className='score-dialog-hero'>
                            <span className='score-dialog-hero-label'>
                                {uiText.score}
                            </span>
                            <strong className='score-dialog-hero-value'>
                                {props.score}
                            </strong>
                        </div>
                        <div className='score-dialog-best-row'>
                            {props.isNewBest ? (
                                <span className='score-dialog-new-best'>
                                    {uiText.newBest}
                                </span>
                            ) : undefined}
                            {!props.isNewBest &&
                            props.bestScore !== undefined &&
                            props.bestScore > 0 ? (
                                <span className='score-dialog-best-label'>
                                    <span className='score-dialog-best-prefix'>
                                        {uiText.bestScore}
                                    </span>
                                    <span className='score-dialog-best-value'>
                                        {props.bestScore}
                                    </span>
                                </span>
                            ) : undefined}
                        </div>
                        <div className='score-dialog-stats'>
                            <StatRow
                                label={uiText.atomized}
                                value={props.atomized}
                            />
                            <StatRow
                                label={uiText.maxCombo}
                                value={props.comboCount}
                            />
                        </div>
                    </>
                )}

                <div className='score-dialog-actions'>
                    {props.mode === 'battle' && props.onRematch ? (
                        <ActionButton
                            onClick={props.onRematch}
                            variant='secondary'
                        >
                            {uiText.rematch}
                        </ActionButton>
                    ) : undefined}
                    {props.mode === 'solo' && props.onRetry ? (
                        <ActionButton
                            onClick={props.onRetry}
                            variant='secondary'
                        >
                            {uiText.retry}
                        </ActionButton>
                    ) : undefined}
                    <ActionButton
                        onClick={handleReturnHomeClick}
                        variant='primary'
                    >
                        {uiText.returnHome}
                    </ActionButton>
                </div>
            </section>
        </div>
    );
}

/* Shared stat pill-row */

function StatRow({
    label,
    value,
}: {
    label: string;
    value: number;
}): JSX.Element {
    return (
        <div className='score-dialog-stat-row'>
            <span className='score-dialog-stat-label'>{label}</span>
            <span className='score-dialog-stat-value'>{value}</span>
        </div>
    );
}

/* Battle player column */

function PlayerColumn({ player }: { player: PlayerStats }): JSX.Element {
    const modifier = player.isWinner
        ? ' score-dialog-player--winner'
        : ' score-dialog-player--loser';

    return (
        <div className={`score-dialog-player${modifier}`}>
            <p className='score-dialog-player-name'>
                {player.isWinner ? (
                    <svg
                        aria-hidden='true'
                        className='score-dialog-crown'
                        fill='var(--color-gold)'
                        viewBox='0 0 24 24'
                    >
                        <path d='M2.5 19h19v2h-19zm19.57-9.36c-.21-.8-1.04-1.28-1.84-1.06L14.92 10 12 3.51 9.08 10l-5.31-1.42c-.8-.21-1.62.27-1.83 1.07-.05.2-.06.4-.02.59l1.54 6.76h17.08l1.54-6.76c.09-.19.08-.39.03-.6z' />
                    </svg>
                ) : undefined}
                {player.name}
            </p>
            <div className='score-dialog-stats'>
                <StatRow label={uiText.atomized} value={player.atomized} />
                <StatRow label={uiText.maxCombo} value={player.maxCombo} />
            </div>
        </div>
    );
}
