<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { tutorialStore, TUTORIAL_STEPS } from '$lib/game/tutorialStore';
  import { ChevronLeft, ChevronRight, X } from 'lucide-svelte';
  
  let targetRect: DOMRect | null = null;
  let tooltipStyle = '';
  let mounted = false;
  
  $: state = $tutorialStore;
  $: currentStep = state.isActive ? TUTORIAL_STEPS[state.currentStep] : null;
  $: stepNumber = state.currentStep + 1;
  $: totalSteps = TUTORIAL_STEPS.length;
  
  // Update target element position
  function updateTargetPosition() {
    if (!currentStep || !mounted) return;
    
    if (!currentStep.target) {
      // Center position (no target)
      targetRect = null;
      tooltipStyle = 'top: 50%; left: 50%; transform: translate(-50%, -50%);';
      return;
    }
    
    const element = document.querySelector(currentStep.target);
    if (element) {
      targetRect = element.getBoundingClientRect();
      calculateTooltipPosition();
    } else {
      targetRect = null;
      tooltipStyle = 'top: 50%; left: 50%; transform: translate(-50%, -50%);';
    }
  }
  
  function calculateTooltipPosition() {
    if (!targetRect || !currentStep) return;
    
    const padding = 20;
    
    switch (currentStep.position) {
      case 'top':
        tooltipStyle = `
          bottom: ${window.innerHeight - targetRect.top + padding}px;
          left: ${targetRect.left + targetRect.width / 2}px;
          transform: translateX(-50%);
        `;
        break;
      case 'bottom':
        tooltipStyle = `
          top: ${targetRect.bottom + padding}px;
          left: ${targetRect.left + targetRect.width / 2}px;
          transform: translateX(-50%);
        `;
        break;
      case 'left':
        tooltipStyle = `
          top: ${targetRect.top + targetRect.height / 2}px;
          right: ${window.innerWidth - targetRect.left + padding}px;
          transform: translateY(-50%);
        `;
        break;
      case 'right':
        tooltipStyle = `
          top: ${targetRect.top + targetRect.height / 2}px;
          left: ${targetRect.right + padding}px;
          transform: translateY(-50%);
        `;
        break;
      default:
        tooltipStyle = 'top: 50%; left: 50%; transform: translate(-50%, -50%);';
    }
  }
  
  // Watch for step changes
  $: if (currentStep && mounted) {
    setTimeout(updateTargetPosition, 100);
  }
  
  function handleNext() {
    tutorialStore.next();
  }
  
  function handlePrev() {
    tutorialStore.prev();
  }
  
  function handleSkip() {
    tutorialStore.skip();
  }
  
  function handleKeydown(e: KeyboardEvent) {
    if (!state.isActive) return;
    
    if (e.key === 'ArrowRight' || e.key === 'Enter') {
      handleNext();
    } else if (e.key === 'ArrowLeft') {
      handlePrev();
    } else if (e.key === 'Escape') {
      handleSkip();
    }
  }
  
  onMount(() => {
    mounted = true;
    window.addEventListener('resize', updateTargetPosition);
    window.addEventListener('keydown', handleKeydown);
    
    // Check if should auto-start
    setTimeout(() => {
      tutorialStore.checkAutoStart();
    }, 500);
  });
  
  onDestroy(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', updateTargetPosition);
      window.removeEventListener('keydown', handleKeydown);
    }
  });
</script>

{#if state.isActive && currentStep}
  <!-- Overlay with cutout -->
  <div class="tutorial-overlay">
    {#if targetRect}
      <!-- Top overlay -->
      <div class="overlay-section" style="top: 0; left: 0; right: 0; height: {targetRect.top - 8}px;"></div>
      <!-- Bottom overlay -->
      <div class="overlay-section" style="top: {targetRect.bottom + 8}px; left: 0; right: 0; bottom: 0;"></div>
      <!-- Left overlay -->
      <div class="overlay-section" style="top: {targetRect.top - 8}px; left: 0; width: {targetRect.left - 8}px; height: {targetRect.height + 16}px;"></div>
      <!-- Right overlay -->
      <div class="overlay-section" style="top: {targetRect.top - 8}px; right: 0; left: {targetRect.right + 8}px; height: {targetRect.height + 16}px;"></div>
      
      <!-- Highlight border -->
      <div 
        class="highlight-border"
        style="
          top: {targetRect.top - 8}px;
          left: {targetRect.left - 8}px;
          width: {targetRect.width + 16}px;
          height: {targetRect.height + 16}px;
        "
      ></div>
    {:else}
      <!-- Full overlay when no target -->
      <div class="overlay-section" style="inset: 0;"></div>
    {/if}
  </div>
    
  <!-- Tooltip -->
  <div class="tutorial-tooltip" style={tooltipStyle}>
    <!-- Header -->
    <div class="tooltip-header">
      <span class="step-indicator">{stepNumber} of {totalSteps}</span>
      <button class="close-btn" on:click={handleSkip} aria-label="Skip tutorial">
        <X size={16} />
      </button>
    </div>
    
    <!-- Content -->
    <h3 class="tooltip-title">{currentStep.title}</h3>
    <p class="tooltip-description">{currentStep.description}</p>
    
    <!-- Footer -->
    <div class="tooltip-footer">
      <button 
        class="btn btn-ghost"
        on:click={handlePrev}
        disabled={state.currentStep === 0}
      >
        <ChevronLeft size={16} />
        Back
      </button>
      
      <div class="step-dots">
        {#each TUTORIAL_STEPS as _, i}
          <span 
            class="dot" 
            class:active={i === state.currentStep}
            class:completed={i < state.currentStep}
          />
        {/each}
      </div>
      
      <button class="btn btn-primary" on:click={handleNext}>
        {state.currentStep === TUTORIAL_STEPS.length - 1 ? "Start" : 'Next'}
        <ChevronRight size={16} />
      </button>
    </div>
  </div>
{/if}

<style>
  .tutorial-overlay {
    position: fixed;
    inset: 0;
    z-index: 9998;
    pointer-events: none;
  }
  
  .overlay-section {
    position: fixed;
    background: rgba(0, 0, 0, 0.8);
    pointer-events: auto;
  }
  
  .highlight-border {
    position: fixed;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 8px;
    pointer-events: none;
    z-index: 9999;
  }
  
  .tutorial-tooltip {
    position: fixed;
    background: hsl(0 0% 9%);
    border: 1px solid hsl(0 0% 14.9%);
    border-radius: 8px;
    padding: 16px;
    max-width: 340px;
    width: 90vw;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    z-index: 10000;
    animation: tooltip-appear 0.2s ease-out;
  }
  
  @keyframes tooltip-appear {
    from {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.96);
    }
    to {
      opacity: 1;
    }
  }
  
  .tooltip-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }
  
  .step-indicator {
    font-size: 12px;
    color: hsl(0 0% 45%);
    font-weight: 500;
  }
  
  .close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: none;
    background: transparent;
    color: hsl(0 0% 45%);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.15s;
  }
  
  .close-btn:hover {
    background: hsl(0 0% 14.9%);
    color: hsl(0 0% 98%);
  }
  
  .tooltip-title {
    font-size: 16px;
    font-weight: 600;
    color: hsl(0 0% 98%);
    margin: 0 0 8px;
    line-height: 1.4;
  }
  
  .tooltip-description {
    font-size: 14px;
    color: hsl(0 0% 63.9%);
    line-height: 1.6;
    margin: 0 0 16px;
  }
  
  .tooltip-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding-top: 12px;
    border-top: 1px solid hsl(0 0% 14.9%);
  }
  
  .btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 8px 12px;
    border: none;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
  }
  
  .btn-ghost {
    background: transparent;
    color: hsl(0 0% 63.9%);
  }
  
  .btn-ghost:hover:not(:disabled) {
    background: hsl(0 0% 14.9%);
    color: hsl(0 0% 98%);
  }
  
  .btn-ghost:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
  
  .btn-primary {
    background: hsl(0 0% 98%);
    color: hsl(0 0% 9%);
  }
  
  .btn-primary:hover {
    background: hsl(0 0% 90%);
  }
  
  .step-dots {
    display: flex;
    gap: 4px;
  }
  
  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: hsl(0 0% 20%);
    transition: all 0.2s;
  }
  
  .dot.active {
    background: hsl(0 0% 98%);
    width: 16px;
    border-radius: 3px;
  }
  
  .dot.completed {
    background: hsl(0 0% 45%);
  }
  
  @media (max-width: 640px) {
    .tutorial-tooltip {
      max-width: calc(100vw - 32px);
      padding: 14px;
    }
    
    .step-dots {
      display: none;
    }
  }
</style>
