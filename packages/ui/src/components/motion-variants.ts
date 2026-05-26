import type { Variants } from 'framer-motion';
import { motion as tokens } from '../tokens';

/** Section reveal — content fades in from below, used for hero blocks. */
export const sectionReveal: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: tokens.duration.slow, ease: tokens.ease.out },
  },
};

/** Staggered list — for grids of cards. Apply to parent. */
export const staggerParent: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07, delayChildren: 0.08 },
  },
};

/** Card rise — child of staggerParent. */
export const cardRise: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.985 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: tokens.duration.base, ease: tokens.ease.out },
  },
};

/** Soft float — hover lift used on FloatingCard. */
export const hoverLift = {
  rest: { y: 0, transition: { duration: tokens.duration.base, ease: tokens.ease.out } },
  hover: { y: -4, transition: { duration: tokens.duration.fast, ease: tokens.ease.out } },
};

/** Page transition — fade & scale, cinematic. */
export const pageTransition: Variants = {
  initial: { opacity: 0, scale: 0.995 },
  enter: {
    opacity: 1,
    scale: 1,
    transition: { duration: tokens.duration.slow, ease: tokens.ease.out },
  },
  exit: {
    opacity: 0,
    scale: 1.005,
    transition: { duration: tokens.duration.fast, ease: tokens.ease.out },
  },
};

/** Accordion expand. */
export const accordionExpand: Variants = {
  collapsed: { height: 0, opacity: 0, transition: { duration: 0.22, ease: tokens.ease.out } },
  expanded: {
    height: 'auto',
    opacity: 1,
    transition: { duration: 0.34, ease: tokens.ease.out },
  },
};
