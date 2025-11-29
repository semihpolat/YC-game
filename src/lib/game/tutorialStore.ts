import { writable, get } from 'svelte/store';

export interface TutorialStep {
  id: string;
  target: string; // CSS selector for the element to highlight
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: 'click' | 'none'; // What user needs to do
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    target: '',
    title: 'Welcome to YC Simulator',
    description: 'You have 12 weeks to build a startup good enough to get into Y Combinator. Let me show you how it works.',
    position: 'center',
    action: 'none'
  },
  {
    id: 'metrics',
    target: '[data-tutorial="metrics"]',
    title: 'Your Startup Metrics',
    description: 'These are your key metrics: Cash (runway), Discord members, GitHub stars, MRR, Visitors, and most importantly - your Sanity. Keep an eye on all of them.',
    position: 'bottom',
    action: 'none'
  },
  {
    id: 'week',
    target: '[data-tutorial="week"]',
    title: 'Time is Ticking',
    description: 'You have 12 weeks until YC applications close. The red bar shows how much time you have left.',
    position: 'bottom',
    action: 'none'
  },
  {
    id: 'energy',
    target: '[data-tutorial="energy"]',
    title: 'Energy System',
    description: 'Each action costs energy. You start with 10 energy per week. Spend it wisely.',
    position: 'bottom',
    action: 'none'
  },
  {
    id: 'map',
    target: '[data-tutorial="map"]',
    title: 'The Startup Map',
    description: 'This is your world. Each node represents an action you can take - from coding to marketing to networking. Click on nodes to see what they do.',
    position: 'center',
    action: 'none'
  },
  {
    id: 'node',
    target: '',
    title: 'Taking Actions',
    description: 'Click on any unlocked node (the app windows) to see its details, energy cost, and potential rewards. Some nodes are locked until you complete related tasks. Each cluster represents a different area: Code, Marketing, Fundraising, etc.',
    position: 'center',
    action: 'none'
  },
  {
    id: 'endweek',
    target: '[data-tutorial="endweek"]',
    title: 'End Your Week',
    description: 'When you\'re done taking actions, click "END WEEK" to move to the next week. Random events may occur.',
    position: 'left',
    action: 'none'
  },
  {
    id: 'yc',
    target: '[data-tutorial="yc-button"]',
    title: 'Apply to YC',
    description: 'When you reach Week 12, the "Apply to YC" button will activate. Your metrics will determine if you get accepted. Good luck.',
    position: 'bottom',
    action: 'none'
  },
  {
    id: 'done',
    target: '',
    title: 'You\'re Ready',
    description: 'Now go build something amazing. Remember: balance is key. Don\'t burn out, but don\'t be lazy either. See you at Demo Day.',
    position: 'center',
    action: 'none'
  }
];

interface TutorialState {
  isActive: boolean;
  currentStep: number;
  hasCompletedOnce: boolean;
}

const STORAGE_KEY = 'yc-game-tutorial-completed';

function createTutorialStore() {
  // Check localStorage for tutorial completion
  const hasCompleted = typeof window !== 'undefined' 
    ? localStorage.getItem(STORAGE_KEY) === 'true'
    : false;

  const initialState: TutorialState = {
    isActive: false,
    currentStep: 0,
    hasCompletedOnce: hasCompleted
  };

  const { subscribe, set, update } = writable<TutorialState>(initialState);

  return {
    subscribe,
    
    // Start tutorial (called on first visit or from settings)
    start: () => {
      update(state => ({
        ...state,
        isActive: true,
        currentStep: 0
      }));
    },
    
    // Go to next step
    next: () => {
      update(state => {
        const nextStep = state.currentStep + 1;
        if (nextStep >= TUTORIAL_STEPS.length) {
          // Tutorial completed
          if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, 'true');
          }
          return {
            ...state,
            isActive: false,
            currentStep: 0,
            hasCompletedOnce: true
          };
        }
        return {
          ...state,
          currentStep: nextStep
        };
      });
    },
    
    // Go to previous step
    prev: () => {
      update(state => ({
        ...state,
        currentStep: Math.max(0, state.currentStep - 1)
      }));
    },
    
    // Skip tutorial
    skip: () => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, 'true');
      }
      update(state => ({
        ...state,
        isActive: false,
        currentStep: 0,
        hasCompletedOnce: true
      }));
    },
    
    // Check if should auto-start (first visit)
    checkAutoStart: () => {
      update(state => {
        if (!state.hasCompletedOnce && typeof window !== 'undefined') {
          const hasCompleted = localStorage.getItem(STORAGE_KEY) === 'true';
          if (!hasCompleted) {
            return {
              ...state,
              isActive: true,
              currentStep: 0
            };
          }
        }
        return state;
      });
    },
    
    // Get current step data
    getCurrentStep: (): TutorialStep | null => {
      const state = get({ subscribe });
      if (!state.isActive) return null;
      return TUTORIAL_STEPS[state.currentStep] || null;
    }
  };
}

export const tutorialStore = createTutorialStore();

