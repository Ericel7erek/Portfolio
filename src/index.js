import initScrollReveal from "./scripts/scrollReveal";
import initTiltEffect from "./scripts/tiltAnimation";
import { targetElements, defaultProps } from "./data/scrollRevealConfig";
import { updateVisitorCount, trackVisitorInfo } from './scripts/firebaseUtils';

// Initialize animations and Firebase
initScrollReveal(targetElements, defaultProps);
initTiltEffect();
updateVisitorCount();  // Update visitor count
trackVisitorInfo();  // Track visitor info
