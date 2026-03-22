import { tutorialLessonText } from '../app-state';
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

type TutorialLessonConfig = {
    isBlocking: boolean;
    lessonId: keyof typeof tutorialLessonText;
    position: 'bottom' | 'top';
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
            isBlocking: true,
            lessonId: 'intro',
            position: 'bottom',
        },
        nextActionStep: TutorialStep.StageOnePrime,
    },
    [TutorialStep.StageOnePrime]: {
        expectedQueue: fullFactorQueue,
        getHighlightedPrime: () => 2,
        getHighlightTarget: () => 'keypad',
        lesson: {
            isBlocking: false,
            lessonId: 'stageOnePrime',
            position: 'top',
        },
    },
    [TutorialStep.StageOneQueue]: {
        expectedQueue: fullFactorQueue,
        getHighlightedPrime: () => 3,
        getHighlightTarget: () => 'queue',
        lesson: {
            isBlocking: false,
            lessonId: 'stageOneQueue',
            position: 'top',
        },
    },
    [TutorialStep.StageOneSubmit]: {
        expectedQueue: fullFactorQueue,
        getHighlightTarget: () => 'submit',
        lesson: {
            isBlocking: false,
            lessonId: 'stageOneSubmit',
            position: 'top',
        },
    },
    [TutorialStep.StageOneResult]: {
        getHighlightTarget: () => 'enemy-hp',
        lesson: {
            isBlocking: true,
            lessonId: 'stageOneResult',
            position: 'bottom',
        },
        nextActionStep: TutorialStep.StageTwoPrime,
    },
    [TutorialStep.StageTwoPrime]: {
        expectedQueue: fullFactorQueue,
        getHighlightedPrime: () => 2,
        getHighlightTarget: () => 'keypad',
        lesson: {
            isBlocking: false,
            lessonId: 'stageTwoPrime',
            position: 'top',
        },
    },
    [TutorialStep.StageTwoQueue]: {
        expectedQueue: fullFactorQueue,
        getHighlightedPrime: () => 3,
        getHighlightTarget: () => 'keypad',
        lesson: {
            isBlocking: false,
            lessonId: 'stageTwoQueue',
            position: 'top',
        },
    },
    [TutorialStep.StageTwoSubmit]: {
        expectedQueue: fullFactorQueue,
        getHighlightTarget: () => 'submit',
        lesson: {
            isBlocking: false,
            lessonId: 'stageTwoSubmit',
            position: 'top',
        },
    },
    [TutorialStep.StageTwoResult]: {
        lesson: {
            isBlocking: true,
            lessonId: 'stageTwoResult',
            position: 'bottom',
        },
        nextActionStep: TutorialStep.StageTwoFinish,
    },
    [TutorialStep.StageTwoFinish]: {
        expectedQueue: finishQueue,
        getHighlightedPrime: () => 5,
        getHighlightTarget: () => 'keypad',
        lesson: {
            isBlocking: false,
            lessonId: 'stageTwoFinish',
            position: 'top',
        },
    },
    [TutorialStep.StageTwoFinishSubmit]: {
        expectedQueue: finishQueue,
        getHighlightTarget: () => 'submit',
        lesson: {
            isBlocking: false,
            lessonId: 'stageTwoFinishSubmit',
            position: 'top',
        },
    },
    [TutorialStep.EnemyTurn]: {
        actionEffect: 'allow-cpu-attack',
        getHighlightTarget: () => 'self-hp',
        lesson: {
            isBlocking: true,
            lessonId: 'enemyTurn',
            position: 'bottom',
        },
    },
    [TutorialStep.EnemyAttack]: {
        getHighlightTarget: () => 'self-hp',
        lesson: {
            isBlocking: true,
            lessonId: 'enemyAttack',
            position: 'top',
        },
        nextActionStep: TutorialStep.TryWrongPrime,
    },
    [TutorialStep.TryWrongPrime]: {
        expectedQueue: wrongPrimeQueue,
        getHighlightedPrime: (queue) => (queue.length === 0 ? 3 : undefined),
        getHighlightTarget: (queue) =>
            queue.length === 0 ? 'keypad' : 'submit',
        lesson: {
            isBlocking: false,
            lessonId: 'tryWrongPrime',
            position: 'top',
        },
    },
    [TutorialStep.WrongPrimeResult]: {
        getHighlightTarget: () => 'self-hp',
        lesson: {
            isBlocking: true,
            lessonId: 'wrongPrimeResult',
            position: 'bottom',
        },
        nextActionStep: TutorialStep.Summary,
    },
    [TutorialStep.Summary]: {
        actionEffect: 'complete-tutorial',
        lesson: {
            isBlocking: true,
            lessonId: 'summary',
            position: 'bottom',
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

    const lessonText = tutorialLessonText[lesson.lessonId];

    return {
        actionLabel:
            'actionLabel' in lessonText ? lessonText.actionLabel : undefined,
        body: lessonText.body,
        isBlocking: lesson.isBlocking,
        position: lesson.position,
        title: lessonText.title,
    };
}
