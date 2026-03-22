import { uiText } from '../app-state';
import type { Prime } from '../core';

export type TutorialFocusTarget =
    | 'self-blob'
    | 'queue'
    | 'keypad'
    | 'submit'
    | 'enemy-hp'
    | 'self-hp';

export enum TutorialStep {
    Intro = 'Intro',
    StageOnePrime = 'StageOnePrime',
    StageOneQueue = 'StageOneQueue',
    StageOneSubmit = 'StageOneSubmit',
    StageOneResult = 'StageOneResult',
    StageTwoPrime = 'StageTwoPrime',
    StageTwoQueue = 'StageTwoQueue',
    StageTwoSubmit = 'StageTwoSubmit',
    StageTwoResult = 'StageTwoResult',
    StageTwoFinish = 'StageTwoFinish',
    StageTwoFinishSubmit = 'StageTwoFinishSubmit',
    EnemyTurn = 'EnemyTurn',
    EnemyAttack = 'EnemyAttack',
    TryWrongPrime = 'TryWrongPrime',
    WrongPrimeResult = 'WrongPrimeResult',
    Summary = 'Summary',
    Done = 'Done',
}

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
    [TutorialStep.Intro]: {
        getHighlightTarget: () => 'self-blob',
        lesson: {
            actionLabelKey: 'tutorialStartLesson',
            bodyKey: 'tutorialIntroBody',
            isBlocking: true,
            position: 'top',
            titleKey: 'tutorialIntroTitle',
        },
        nextActionStep: TutorialStep.StageOnePrime,
    },
    [TutorialStep.StageOnePrime]: {
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
    [TutorialStep.StageOneQueue]: {
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
    [TutorialStep.StageOneSubmit]: {
        expectedQueue: fullFactorQueue,
        getHighlightTarget: () => 'submit',
        lesson: {
            bodyKey: 'tutorialStageOneSubmitBody',
            isBlocking: false,
            position: 'top',
            titleKey: 'tutorialStageOneSubmitTitle',
        },
    },
    [TutorialStep.StageOneResult]: {
        getHighlightTarget: () => 'enemy-hp',
        lesson: {
            actionLabelKey: 'tutorialNextBlob',
            bodyKey: 'tutorialStageOneResultBody',
            isBlocking: true,
            position: 'bottom',
            titleKey: 'tutorialStageOneResultTitle',
        },
        nextActionStep: TutorialStep.StageTwoPrime,
    },
    [TutorialStep.StageTwoPrime]: {
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
    [TutorialStep.StageTwoQueue]: {
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
    [TutorialStep.StageTwoSubmit]: {
        expectedQueue: fullFactorQueue,
        getHighlightTarget: () => 'submit',
        lesson: {
            bodyKey: 'tutorialStageTwoSubmitBody',
            isBlocking: false,
            position: 'top',
            titleKey: 'tutorialStageTwoSubmitTitle',
        },
    },
    [TutorialStep.StageTwoResult]: {
        lesson: {
            actionLabelKey: 'tutorialUseLastFactor',
            bodyKey: 'tutorialStageTwoResultBody',
            isBlocking: true,
            position: 'bottom',
            titleKey: 'tutorialStageTwoResultTitle',
        },
        nextActionStep: TutorialStep.StageTwoFinish,
    },
    [TutorialStep.StageTwoFinish]: {
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
    [TutorialStep.StageTwoFinishSubmit]: {
        expectedQueue: finishQueue,
        getHighlightTarget: () => 'submit',
        lesson: {
            bodyKey: 'tutorialStageTwoFinishSubmitBody',
            isBlocking: false,
            position: 'top',
            titleKey: 'tutorialStageTwoFinishSubmitTitle',
        },
    },
    [TutorialStep.EnemyTurn]: {
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
    [TutorialStep.EnemyAttack]: {
        getHighlightTarget: () => 'self-hp',
        lesson: {
            actionLabelKey: 'tutorialTryMistake',
            bodyKey: 'tutorialEnemyAttackBody',
            isBlocking: true,
            position: 'top',
            titleKey: 'tutorialEnemyAttackTitle',
        },
        nextActionStep: TutorialStep.TryWrongPrime,
    },
    [TutorialStep.TryWrongPrime]: {
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
    [TutorialStep.WrongPrimeResult]: {
        getHighlightTarget: () => 'self-hp',
        lesson: {
            actionLabelKey: 'tutorialWrapUp',
            bodyKey: 'tutorialWrongPrimeResultBody',
            isBlocking: true,
            position: 'bottom',
            titleKey: 'tutorialWrongPrimeResultTitle',
        },
        nextActionStep: TutorialStep.Summary,
    },
    [TutorialStep.Summary]: {
        actionEffect: 'complete-tutorial',
        lesson: {
            actionLabelKey: 'tutorialKeepPlaying',
            bodyKey: 'tutorialSummaryBody',
            isBlocking: true,
            position: 'bottom',
            titleKey: 'tutorialSummaryTitle',
        },
    },
    [TutorialStep.Done]: {},
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
