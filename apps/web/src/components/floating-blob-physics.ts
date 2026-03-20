export type FloatingBlobParticle<BlobId extends string> = {
    id: BlobId;
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
};

export type FloatingCircleCollider = {
    centerX: number;
    centerY: number;
    radius: number;
};

export type FloatingActiveDrag<BlobId extends string> = {
    blobId: BlobId;
    pointerId: number;
    x: number;
    y: number;
    offsetX: number;
    offsetY: number;
    startClientX: number;
    startClientY: number;
    lastClientX: number;
    lastClientY: number;
    lastTimestamp: number;
    moved: boolean;
};

export function clampFloatingValue(
    value: number,
    min: number,
    max: number
): number {
    return Math.min(Math.max(value, min), max);
}

export function writeFloatingParticleStyles<BlobId extends string>(
    particles: ReadonlyArray<FloatingBlobParticle<BlobId>>,
    elements: ReadonlyMap<BlobId, HTMLElement>,
    xVarName = '--blob-x',
    yVarName = '--blob-y'
): void {
    for (const particle of particles) {
        const element = elements.get(particle.id);

        if (!element) {
            continue;
        }

        element.style.setProperty(xVarName, `${particle.x}px`);
        element.style.setProperty(yVarName, `${particle.y}px`);
    }
}

export function getFloatingTitleOrbCollider(
    field: Readonly<HTMLDivElement>,
    orb: Readonly<HTMLDivElement>
): FloatingCircleCollider {
    const fieldRect = field.getBoundingClientRect();
    const orbRect = orb.getBoundingClientRect();

    return {
        centerX: orbRect.left - fieldRect.left + orbRect.width / 2,
        centerY: orbRect.top - fieldRect.top + orbRect.height / 2,
        radius: orbRect.width / 2,
    };
}

export function clampFloatingParticlePosition(
    x: number,
    y: number,
    radius: number,
    fieldRect: Readonly<DOMRect>,
    wallPadding: number
): { x: number; y: number } {
    const maxX = Math.max(
        wallPadding,
        fieldRect.width - radius * 2 - wallPadding
    );
    const maxY = Math.max(
        wallPadding,
        fieldRect.height - radius * 2 - wallPadding
    );

    return {
        x: clampFloatingValue(x, wallPadding, maxX),
        y: clampFloatingValue(y, wallPadding, maxY),
    };
}

export function clampFloatingParticleOutsideCollider(
    x: number,
    y: number,
    radius: number,
    collider: Readonly<FloatingCircleCollider>,
    titleOrbClearance: number
): { x: number; y: number } {
    const centerX = x + radius;
    const centerY = y + radius;
    const deltaX = centerX - collider.centerX;
    const deltaY = centerY - collider.centerY;
    const distance = Math.hypot(deltaX, deltaY) || 0.001;
    const minimumDistance = collider.radius + radius + titleOrbClearance;

    if (distance >= minimumDistance) {
        return { x, y };
    }

    const normalX = deltaX / distance;
    const normalY = deltaY / distance;
    const pushedCenterX = collider.centerX + normalX * minimumDistance;
    const pushedCenterY = collider.centerY + normalY * minimumDistance;

    return {
        x: pushedCenterX - radius,
        y: pushedCenterY - radius,
    };
}

export function resolveFloatingTitleOrbCollision<BlobId extends string>(
    particles: ReadonlyArray<FloatingBlobParticle<BlobId>>,
    collider: Readonly<FloatingCircleCollider>,
    titleOrbClearance: number
): void {
    for (const particle of particles) {
        const particleCenterX = particle.x + particle.radius;
        const particleCenterY = particle.y + particle.radius;
        const deltaX = particleCenterX - collider.centerX;
        const deltaY = particleCenterY - collider.centerY;
        const distance = Math.hypot(deltaX, deltaY) || 0.001;
        const minimumDistance =
            collider.radius + particle.radius + titleOrbClearance;

        if (distance >= minimumDistance) {
            continue;
        }

        const normalX = deltaX / distance;
        const normalY = deltaY / distance;
        const overlap = minimumDistance - distance;
        const currentNormalVelocity =
            particle.vx * normalX + particle.vy * normalY;

        particle.x += normalX * overlap;
        particle.y += normalY * overlap;

        if (currentNormalVelocity < 0) {
            particle.vx -= 2 * currentNormalVelocity * normalX;
            particle.vy -= 2 * currentNormalVelocity * normalY;
        }
    }
}

export function resolveFloatingBlobCollisions<BlobId extends string>(
    particles: ReadonlyArray<FloatingBlobParticle<BlobId>>,
    collisionGap: number
): void {
    for (let index = 0; index < particles.length; index++) {
        const current = particles[index];

        for (
            let nextIndex = index + 1;
            nextIndex < particles.length;
            nextIndex++
        ) {
            const next = particles[nextIndex];
            const deltaX = next.x + next.radius - (current.x + current.radius);
            const deltaY = next.y + next.radius - (current.y + current.radius);
            const distance = Math.hypot(deltaX, deltaY) || 0.001;
            const minimumDistance = current.radius + next.radius + collisionGap;

            if (distance >= minimumDistance) {
                continue;
            }

            const normalX = deltaX / distance;
            const normalY = deltaY / distance;
            const overlap = (minimumDistance - distance) / 2;

            current.x -= normalX * overlap;
            current.y -= normalY * overlap;
            next.x += normalX * overlap;
            next.y += normalY * overlap;

            const currentNormalVelocity =
                current.vx * normalX + current.vy * normalY;
            const nextNormalVelocity = next.vx * normalX + next.vy * normalY;
            const currentTangentX =
                current.vx - currentNormalVelocity * normalX;
            const currentTangentY =
                current.vy - currentNormalVelocity * normalY;
            const nextTangentX = next.vx - nextNormalVelocity * normalX;
            const nextTangentY = next.vy - nextNormalVelocity * normalY;

            current.vx = currentTangentX + nextNormalVelocity * normalX;
            current.vy = currentTangentY + nextNormalVelocity * normalY;
            next.vx = nextTangentX + currentNormalVelocity * normalX;
            next.vy = nextTangentY + currentNormalVelocity * normalY;
        }
    }
}
