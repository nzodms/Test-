/**
 * Motion tokens — the only place durations and easings live.
 * The product must feel precise, not playful: short distances,
 * decisive curves, no bounce.
 */
export const motionTokens = {
  duration: {
    instant: 0.12,
    fast: 0.18,
    base: 0.32,
    slow: 0.55,
    reveal: 0.8,
  },
  ease: {
    standard: [0.22, 1, 0.36, 1] as const,
    enter: [0.16, 1, 0.3, 1] as const,
    exit: [0.4, 0, 1, 1] as const,
  },
} as const;

export const enterTransition = {
  duration: motionTokens.duration.base,
  ease: motionTokens.ease.enter,
};

export const revealTransition = {
  duration: motionTokens.duration.reveal,
  ease: motionTokens.ease.standard,
};
