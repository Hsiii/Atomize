import { uiText } from '../app-state';
import type { Prime } from '../core';

export type TutorialFocusTarget =
    | 'self-blob'
    | 'queue'
    | 'keypad'
    | 'submit'
    | 'enemy-hp'
    | 'self-hp';

export type TutorialStep =
    | 'intro'
    | 'stage-one-prime'
    | 'stage-one-queue'
    | 'stage-one-submit'
    | 'stage-one-result'
    | 'stage-two-prime'
    | 'stage-two-queue'
    | 'stage-two-submit'
    | 'stage-two-result'
    | 'stage-two-finish'
    | 'stage-two-finish-submit'
    | 'enemy-turn'
    | 'enemy-attack'
    | 'try-wrong-prime'
    | 'wrong-prime-result'
    | 'summary'
    | 'done';

export type TutorialLesson = {
    actionLabel?: string;
    body: string;
    isBlocking: boolean;
    position: 'bottom' | 'top';
    title: string;
};

type TutorialTextKey = keyof typeof uiText;

type TutorialLessonConfig = {
    actionLabelKey?: TutorialTextKey;
    bodyKey: TutorialTextKey;
    isBlocking: boolean;
    position: 'bottom' | 'top';
    titleKey: TutorialTextKey;
};

type TutorialActionEffect = 'allow-cpu-attack' | 'complete-tutorial';

type TutorialStepConfig = {
    actionEffect?: TutorialActionEffect;
    expectedQueue?: readonly Prime[];
    getHighlightedPrime?: (queue: readonly Prime[]) => Prime | undefined;
    getHighlightTarget?: (
        queue: readonly Prime[]
    ) => TutorialFocusTarget | undefined;
    lesson?: TutorialLessonConfig;
    nextActionStep?: TutorialStep;
};

const fullFactorQueue = [2, 3] as const;
const finishQueue = [5] as const;
const wrongPrimeQueue = [3] as const;

const tutorialStepConfig: Record<TutorialStep, TutorialStepConfig> = {
    'intro': {
        getHighlightTarget: () => 'self-blob',
        lesson: {
            actionLabelKey: 'tutorialStartLesson',
            bodyKey: 'tutorialIntroBody',
            isBlocking: true,
            position: 'top',
            titleKey: 'tutorialIntroTitle',
        },
        nextActionStep: 'stage-one-prime',
    },
    'stage-one-prime': {
        expectedQueue: fullFactorQueue,
        getHighlightedPrime: () => 2,
        getHighlightTarget: () => 'keypad',
        lesson: {
            bodyKey: 'tutorialStageOnePrimeBody',
            isBlocking: false,
            position: 'top',
            titleKey: 'tutorialStageOnePrimeTitle',
        },
    },
    'stage-one-queue': {
        expectedQueue: fullFactorQueue,
        getHighlightedPrime: () => 3,
        getHighlightTarget: () => 'queue',
        lesson: {
            bodyKey: 'tutorialStageOneQueueBody',
            isBlocking: false,
            position: 'top',
            titleKey: 'tutorialStageOneQueueTitle',
        },
    },
    'stage-one-submit': {
        expectedQueue: fullFactorQueue,
        getHighlightTarget: () => 'submit',
        lesson: {
            bodyKey: 'tutorialStageOneSubmitBody',
            isBlocking: false,
            position: 'top',
            titleKey: 'tutorialStageOneSubmitTitle',
        },
    },
    'stage-one-result': {
        getHighlightTarget: () => 'enemy-hp',
        lesson: {
            actionLabelKey: 'tutorialNextBlob',
            bodyKey: 'tutorialStageOneResultBody',
            isBlocking: true,
            position: 'bottom',
            titleKey: 'tutorialStageOneResultTitle',
        },
        nextActionStep: 'stage-two-prime',
    },
    'stage-two-prime': {
        expectedQueue: fullFactorQueue,
        getHighlightedPrime: () => 2,
        getHighlightTarget: () => 'keypad',
        lesson: {
            bodyKey: 'tutorialStageTwoPrimeBody',
            isBlocking: false,
            position: 'top',
            titleKey: 'tutorialStageTwoPrimeTitle',
        },
    },
    'stage-two-queue': {
        expectedQueue: fullFactorQueue,
        getHighlightedPrime: () => 3,
        getHighlightTarget: () => 'keypad',
        lesson: {
            bodyKey: 'tutorialStageTwoQueueBody',
            isBlocking: false,
            position: 'top',
            titleKey: 'tutorialStageTwoQueueTitle',
        },
    },
    'stage-two-submit': {
        expectedQueue: fullFactorQueue,
        getHighlightTarget: () => 'submit',
        lesson: {
            bodyKey: 'tutorialStageTwoSubmitBody',
            isBlocking: false,
            position: 'top',
            titleKey: 'tutorialStageTwoSubmitTitle',
        },
    },
    'stage-two-result': {
        lesson: {
            actionLabelKey: 'tutorialUseLastFactor',
            bodyKey: 'tutorialStageTwoResultBody',
            isBlocking: true,
            position: 'bottom',
            titleKey: 'tutorialStageTwoResultTitle',
        },
        nextActionStep: 'stage-two-finish',
    },
    'stage-two-finish': {
        expectedQueue: finishQueue,
        getHighlightedPrime: () => 5,
        getHighlightTarget: () => 'keypad',
        lesson: {
            bodyKey: 'tutorialStageTwoFinishBody',
            isBlocking: false,
            position: 'top',
            titleKey: 'tutorialStageTwoFinishTitle',
        },
    },
    'stage-two-finish-submit': {
        expectedQueue: finishQueue,
        getHighlightTarget: () => 'submit',
        lesson: {
            bodyKey: 'tutorialStageTwoFinishSubmitBody',
            isBlocking: false,
            position: 'top',
            titleKey: 'tutorialStageTwoFinishSubmitTitle',
        },
    },
    'enemy-turn': {
        actionEffect: 'allow-cpu-attack',
        getHighlightTarget: () => 'self-hp',
        lesson: {
            actionLabelKey: 'tutorialShowAttack',
            bodyKey: 'tutorialEnemyTurnBody',
            isBlocking: true,
            position: 'bottom',
            titleKey: 'tutorialEnemyTurnTitle',
        },
    },
    'enemy-attack': {
        getHighlightTarget: () => 'self-hp',
        lesson: {
            actionLabelKey: 'tutorialTryMistake',
            bodyKey: 'tutorialEnemyAttackBody',
            isBlocking: true,
            position: 'top',
            titleKey: 'tutorialEnemyAttackTitle',
        },
        nextActionStep: 'try-wrong-prime',
    },
    'try-wrong-prime': {
        expectedQueue: wrongPrimeQueue,
        getHighlightedPrime: (queue) => (queue.length === 0 ? 3 : undefined),
        getHighlightTarget: (queue) =>
            queue.length === 0 ? 'keypad' : 'submit',
        lesson: {
            bodyKey: 'tutorialTryWrongPrimeBody',
            isBlocking: false,
            position: 'top',
            titleKey: 'tutorialTryWrongPrimeTitle',
        },
    },
    'wrong-prime-result': {
        getHighlightTarget: () => 'self-hp',
        lesson: {
            actionLabelKey: 'tutorialWrapUp',
            bodyKey: 'tutorialWrongPrimeResultBody',
            isBlocking: true,
            position: 'bottom',
            titleKey: 'tutorialWrongPrimeResultTitle',
        },
        nextActionStep: 'summary',
    },
    'summary': {
        actionEffect: 'complete-tutorial',
        lesson: {
            actionLabelKey: 'tutorialKeepPlaying',
            bodyKey: 'tutorialSummaryBody',
            isBlocking: true,
            position: 'bottom',
            titleKey: 'tutorialSummaryTitle',
        },
    },
    'done': {},
};

export const tutorialStageFactors = {
    cpu: [
        [2, 5],
        [3, 3],
        [2, 2, 3],
        [5, 5],
    ],
    player: [
        [2, 3],
        [2, 3, 5],
        [2, 7],
        [3, 7],
        [2, 2, 5],
        [11, 13],
    ],
} as const satisfies Record<
    'cpu' | 'player',
    ReadonlyArray<readonly Prime[] | undefined>
>;

export function getTutorialScriptedFactors(
    side: 'cpu' | 'player',
    stageIndex: number
): readonly Prime[] | undefined {
    if (stageIndex < 0 || stageIndex >= tutorialStageFactors[side].length) {
        return undefined;
    }

    return tutorialStageFactors[side][stageIndex];
}

export function getTutorialAction(step: TutorialStep): {
    actionEffect?: TutorialActionEffect;
    nextActionStep?: TutorialStep;
} {
    const { actionEffect, nextActionStep } = tutorialStepConfig[step];

    return {
        actionEffect,
        nextActionStep,
    };
}

export function getTutorialExpectedQueue(
    step: TutorialStep
): readonly Prime[] | undefined {
    return tutorialStepConfig[step].expectedQueue;
}

export function getTutorialHighlightTarget(
    step: TutorialStep,
    queue: readonly Prime[]
): TutorialFocusTarget | undefined {
    return tutorialStepConfig[step].getHighlightTarget?.(queue);
}

export function getTutorialHighlightedPrime(
    step: TutorialStep,
    queue: readonly Prime[]
): Prime | undefined {
    return tutorialStepConfig[step].getHighlightedPrime?.(queue);
}

export function getTutorialLesson(
    step: TutorialStep
): TutorialLesson | undefined {
    const { lesson } = tutorialStepConfig[step];

    if (!lesson) {
        return undefined;
    }

    return {
        actionLabel: lesson.actionLabelKey
            ? uiText[lesson.actionLabelKey]
            : undefined,
        body: uiText[lesson.bodyKey],
        isBlocking: lesson.isBlocking,
        position: lesson.position,
        title: uiText[lesson.titleKey],
    };
}
