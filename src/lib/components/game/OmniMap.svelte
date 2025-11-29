<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import { NodeStatus, NodeType } from '$lib/game/types';
  import type { GameNode } from '$lib/game/types';

  // Favicon imports
  import faviconVscode from '$lib/assets/favicons/vscode.png';
  import faviconAws from '$lib/assets/favicons/aws.png';
  import faviconReddit from '$lib/assets/favicons/reddit.png';
  import faviconTwitter from '$lib/assets/favicons/twitter.png';
  import faviconLinkedin from '$lib/assets/favicons/linkedin.png';
  import faviconProducthunt from '$lib/assets/favicons/producthunt.png';
  import faviconTor from '$lib/assets/favicons/tor.png';
  import faviconMaps from '$lib/assets/favicons/maps.png';
  import faviconMercury from '$lib/assets/favicons/mercury.png';
  import faviconFigma from '$lib/assets/favicons/figma.png';
  import faviconOpenai from '$lib/assets/favicons/openai.png';
  import faviconNotion from '$lib/assets/favicons/notion.png';
  import faviconStripe from '$lib/assets/favicons/stripe.png';
  import faviconHubspot from '$lib/assets/favicons/hubspot.png';
  import faviconGoogle from '$lib/assets/favicons/google.png';
  import faviconTiktok from '$lib/assets/favicons/tiktok.png';
  import faviconWhoop from '$lib/assets/favicons/whoop.png';
  import faviconVanta from '$lib/assets/favicons/vanta.png';
  import faviconUpwork from '$lib/assets/favicons/upwork.png';
  import faviconSlack from '$lib/assets/favicons/slack.png';
  import faviconAirbnb from '$lib/assets/favicons/airbnb.png';
  import faviconSequoia from '$lib/assets/favicons/sequoia.png';

  export let nodes: GameNode[];
  export let activeNodeId: string | null;
  export let onNodeClick: (nodeId: string) => void;

  const dispatch = createEventDispatcher();

  // --- Canvas State ---
  let container: HTMLDivElement;
  let scale = 1;
  let panX = 0;
  let panY = 0;
  let isDraggingCanvas = false;
  let lastMouseX = 0;
  let lastMouseY = 0;

  // --- Window Drag State ---
  let draggedWindow: string | null = null;
  let zIndexCounter = 100;

  // --- Gesture State ---
  let isGestureActive = false;
  let startScale = 1;

  // Group nodes by cluster
  // Force type assertion to avoid 'unknown' errors in template
  $: clusters = nodes.reduce((acc, node) => {
    if (!acc[node.cluster]) acc[node.cluster] = [];
    acc[node.cluster].push(node);
    return acc;
  }, {} as Record<string, GameNode[]>);

  // Helper to avoid type errors in template
  function getLeafNodes(nodes: unknown): GameNode[] {
    return (nodes as GameNode[]).filter(n => n.type !== NodeType.Hub);
  }

  // Layout State
  let clusterLayout: Record<string, { x: number; y: number; width: number; height: number; z: number }> = {};
  
  // Modern App Themes (macOS Style) with Favicons
  const APP_CONFIG: Record<string, { title: string; type: 'browser' | 'code' | 'chat' | 'doc' | 'finder'; color: string; favicon: string }> = {
    'code': { title: 'VS Code - Project', type: 'code', color: '#2C2C32', favicon: faviconVscode },
    'infra': { title: 'AWS Management Console', type: 'browser', color: '#EC7211', favicon: faviconAws },
    'reddit': { title: 'r/startups - Reddit', type: 'browser', color: '#FF4500', favicon: faviconReddit },
    'twitter': { title: 'X / Home', type: 'browser', color: '#000000', favicon: faviconTwitter },
    'linkedin': { title: 'Feed | LinkedIn', type: 'browser', color: '#0A66C2', favicon: faviconLinkedin },
    'launch': { title: 'Product Hunt - Best New', type: 'browser', color: '#DA552F', favicon: faviconProducthunt },
    'dark': { title: 'Tor Browser', type: 'browser', color: '#4D2376', favicon: faviconTor },
    'sf': { title: 'Maps - San Francisco', type: 'finder', color: '#A855F7', favicon: faviconMaps },
    'fund': { title: 'Mercury Bank - Dashboard', type: 'browser', color: '#10B981', favicon: faviconMercury },
    'design': { title: 'Figma - UI Kit', type: 'code', color: '#F24E1E', favicon: faviconFigma },
    'ai': { title: 'ChatGPT 4o', type: 'chat', color: '#10A37F', favicon: faviconOpenai },
    'ops': { title: 'Notion - Roadmap', type: 'doc', color: '#FFFFFF', favicon: faviconNotion },
    'legal': { title: 'Term_Sheet_Final_v12.pdf', type: 'finder', color: '#FF3B30', favicon: faviconStripe },
    'sales': { title: 'HubSpot - Contacts', type: 'browser', color: '#FF7A59', favicon: faviconHubspot },
    'seo': { title: 'Google Search Console', type: 'browser', color: '#4285F4', favicon: faviconGoogle },
    'content': { title: 'TikTok Creative Center', type: 'browser', color: '#FE2C55', favicon: faviconTiktok },
    'bio': { title: 'Whoop Dashboard', type: 'browser', color: '#CD2026', favicon: faviconWhoop },
    'security': { title: 'Vanta - Compliance', type: 'browser', color: '#2E2E3A', favicon: faviconVanta },
    'outsource': { title: 'Upwork - Messages (3)', type: 'chat', color: '#14A800', favicon: faviconUpwork },
    'culture': { title: 'Slack - #general', type: 'chat', color: '#4A154B', favicon: faviconSlack },
    'nomad': { title: 'Airbnb - Canggu, Bali', type: 'browser', color: '#FF5A5F', favicon: faviconAirbnb },
    'vc': { title: 'Sequoia - Pitch Deck', type: 'finder', color: '#00925D', favicon: faviconSequoia },
    'sins': { title: 'Terminal', type: 'code', color: '#000000', favicon: faviconVscode },
  };

  onMount(() => {
    calculateLayout();
    // Center initially
    if (container) {
        panX = container.clientWidth / 2 - 1500;
        panY = container.clientHeight / 2 - 1000;

        // Add native gesture listeners for Safari/Mac Trackpad
        container.addEventListener('gesturestart', handleGestureStart as any);
        container.addEventListener('gesturechange', handleGestureChange as any);
        container.addEventListener('gestureend', handleGestureEnd as any);
        container.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
        if (container) {
            container.removeEventListener('gesturestart', handleGestureStart as any);
            container.removeEventListener('gesturechange', handleGestureChange as any);
            container.removeEventListener('gestureend', handleGestureEnd as any);
            container.removeEventListener('wheel', handleWheel);
        }
    };
  });

  function calculateLayout() {
    const clusterKeys = Object.keys(clusters);
    const GRID_GAP_X = 500;
    const GRID_GAP_Y = 600;
    const COLS = 5;

    clusterKeys.forEach((cluster, i) => {
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      
      const offsetX = (row % 2 === 0) ? 0 : 100; 
      
      clusterLayout[cluster] = {
        x: col * GRID_GAP_X + offsetX + (Math.random() * 50),
        y: row * GRID_GAP_Y + (Math.random() * 50),
        width: 380,
        height: 450,
        z: i + 1
      };
    });
    clusterLayout = clusterLayout;
  }

  // --- Native Gesture Handlers (Safari) ---
  function handleGestureStart(e: any) {
    e.preventDefault();
    isGestureActive = true;
    startScale = scale;
  }

  function handleGestureChange(e: any) {
    e.preventDefault();
    if (!isGestureActive) return;
    
    // Smooth native-like zoom
    const newScale = Math.min(Math.max(0.1, startScale * e.scale), 4);
    
    // Optional: Zoom towards center of gesture (requires clientX/Y which gesture event might lack or provide)
    // Keeping simple center zoom or current pan zoom for stability
    // A better approach is to find the cursor pos if available, but e.clientX might be undefined on gesture events
    // We'll stick to updating scale directly which feels natural on Mac
    scale = newScale;
  }

  function handleGestureEnd(e: any) {
    e.preventDefault();
    isGestureActive = false;
  }

  // --- Wheel Handler (Chrome/Edge Pinch + All Pan) ---
  function handleWheel(e: WheelEvent) {
    e.preventDefault();
    if (isGestureActive) return; // Prioritize native gesture

    // Detect Pinch gesture (trackpad) vs Pan
    // Chrome/Safari sets ctrlKey to true during a pinch gesture on trackpad
    const isPinch = e.ctrlKey; 

    if (isPinch) {
      // Smooth zoom for pinch
      const zoomSensitivity = 0.01; // Increased sensitivity
      const newScale = Math.min(Math.max(0.1, scale - e.deltaY * zoomSensitivity), 4);
      
      // Zoom towards cursor logic
      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Calculate mouse position in world coordinates
      const worldX = (mouseX - panX) / scale;
      const worldY = (mouseY - panY) / scale;

      // Update scale
      scale = newScale;

      // Update pan to keep worldX/worldY under mouse
      panX = mouseX - worldX * scale;
      panY = mouseY - worldY * scale;
    } else {
      // Regular pan (Two finger scroll on trackpad or Mouse Wheel)
      // We simply subtract delta from pan position
      panX -= e.deltaX;
      panY -= e.deltaY;
    }
  }

  function startPan(e: MouseEvent) {
    // Only pan if clicking directly on background
    if ((e.target as HTMLElement).closest('.mac-window') || (e.target as HTMLElement).closest('.overlay-ui') || (e.target as HTMLElement).closest('.yc-apply-container')) return;
    
    isDraggingCanvas = true;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
    container.style.cursor = 'grabbing';
  }

  function doPan(e: MouseEvent) {
    if (isDraggingCanvas) {
      const dx = e.clientX - lastMouseX;
      const dy = e.clientY - lastMouseY;
      panX += dx;
      panY += dy;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
      return;
    }
    
    if (draggedWindow) {
      // Drag window logic
      const deltaX = (e.clientX - lastMouseX) / scale;
      const deltaY = (e.clientY - lastMouseY) / scale;
      
      clusterLayout[draggedWindow].x += deltaX;
      clusterLayout[draggedWindow].y += deltaY;
      
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
      
      // Trigger reactivity
      clusterLayout = clusterLayout;
    }
  }

  function endPan() {
    isDraggingCanvas = false;
    draggedWindow = null;
    if (container) container.style.cursor = 'default';
  }

  // --- Window Dragging ---

  function startWindowDrag(e: MouseEvent, cluster: string) {
    e.stopPropagation(); // Prevent canvas pan
    draggedWindow = cluster;
    
    // Bring to front
    zIndexCounter++;
    clusterLayout[cluster].z = zIndexCounter;
    clusterLayout = clusterLayout;

    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
  }

  function getNodeStyle(node: GameNode) {
    const isLocked = node.status === NodeStatus.Locked;
    const isBanned = node.status === NodeStatus.Banned;
    const isActive = node.id === activeNodeId;
    return { isLocked, isBanned, isActive };
  }

  function handleNodeClick(node: GameNode) {
    if (node.status !== NodeStatus.Banned && node.type !== NodeType.Hub) {
      onNodeClick(node.id);
    }
  }
  
  function openYCApplication() {
    dispatch('openYCForm');
  }

  $: connections = Object.keys(clusterLayout).map((key, i, arr) => {
      const current = clusterLayout[key];
      const nextKey = arr[i + 1];
      if (!nextKey) return null;
      
      const next = clusterLayout[nextKey];
      if (Math.abs(current.x - next.x) > 1500 && Math.abs(current.y - next.y) > 1500) return null;

      return {
        x1: current.x + current.width / 2,
        y1: current.y + current.height / 2,
        x2: next.x + next.width / 2,
        y2: next.y + next.height / 2
      };
  }).filter((c): c is {x1: number, y1: number, x2: number, y2: number} => c !== null);

</script>

<svelte:window on:mouseup={endPan} />

<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<div 
  role="application"
  aria-label="Infinite Canvas Map"
  bind:this={container}
  class="infinite-canvas"
  on:mousedown={startPan}
  on:mousemove={doPan}
>
  <div 
    class="grid-background"
    style="
      background-position: {panX}px {panY}px;
      background-size: {50 * scale}px {50 * scale}px;
    "
  ></div>

  <div 
    class="transform-layer"
    style="transform: translate({panX}px, {panY}px) scale({scale});"
  >
    <svg class="connections-svg">
      {#each connections as conn}
        <line 
          x1={conn.x1} y1={conn.y1} 
          x2={conn.x2} y2={conn.y2} 
          stroke="rgba(255,255,255,0.1)" 
          stroke-width="4" 
          stroke-dasharray="10,10"
        />
      {/each}
    </svg>

    {#each Object.entries(clusters) as [cluster, clusterNodes] (cluster)}
      {#if clusterLayout[cluster]}
        {@const config = APP_CONFIG[cluster] || { title: cluster, type: 'finder', color: '#666', favicon: '' }}
        {@const layout = clusterLayout[cluster]}
        {@const leafNodes = getLeafNodes(clusterNodes)}
        
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div 
          class="mac-window"
          class:dark-mode={['code', 'sins', 'culture', 'security', 'dark'].includes(cluster)}
          style="
            left: {layout.x}px;
            top: {layout.y}px;
            width: {layout.width}px;
            height: {layout.height}px;
            z-index: {layout.z};
          "
          on:mousedown|stopPropagation
        >
          <div 
            class="window-header cursor-move"
            style="background: {config.type === 'code' || cluster === 'sins' ? '#1e1e1e' : '#f5f5f5'}"
            on:mousedown={(e) => startWindowDrag(e, cluster)}
          >
            <div class="traffic-lights">
              <div class="light close"></div>
              <div class="light minimize"></div>
              <div class="light maximize"></div>
            </div>
            <div class="window-title" style="color: {config.type === 'code' || cluster === 'sins' ? '#999' : '#333'}">
              {#if config.favicon}
                <img src={config.favicon} alt="" class="window-favicon" />
              {/if}
              {config.title}
            </div>
          </div>

          <div class="window-content" class:code-bg={config.type === 'code'} class:terminal-bg={cluster === 'sins'}>
            {#if config.type === 'browser'}
              <div class="browser-bar">
                <div class="nav-arrows">
                  <span>←</span><span>→</span><span>↻</span>
                        </div>
                <div class="url-input">
                  <span class="lock-icon">🔒</span>
                  yc-simulator.com/{cluster}
                        </div>
                    </div>
            {:else if config.type === 'chat'}
              <div class="chat-header">
                <div class="avatar" style="background: {config.color}"></div>
                <div class="chat-info">
                  <div class="chat-name">{config.title.split(' ')[0]}</div>
                  <div class="chat-status">Online</div>
                </div>
              </div>
            {/if}

            <div class="scrollable-content">
              {#if cluster === 'sins'}
                <div class="terminal-text">
                  <span class="prompt">user@yc-sim:~$</span> ./check_status.sh<br>
                  <span class="success">✔</span> Infra scaling... OK<br>
                  <span class="error">✖</span> Tech debt... CRITICAL<br>
                  <span class="prompt">user@yc-sim:~$</span> _<br>
                </div>
              {/if}

              <div class="nodes-list">
                {#each leafNodes as node (node.id)}
                  {@const style = getNodeStyle(node)}
                  <button 
                    class="action-item"
                    class:locked={style.isLocked}
                    class:banned={style.isBanned}
                    class:active={style.isActive}
                    class:risk-high={node.risk > 40}
                    on:click={() => handleNodeClick(node)}
                    disabled={style.isBanned}
                  >
                    <div class="item-icon" style="background: {config.color}20; color: {config.color}">
                      {#if node.type === NodeType.Vanity}📈
                      {:else if node.type === NodeType.DarkPattern}💀
                      {:else if node.type === NodeType.GoldMine}💎
                      {:else if node.type === NodeType.Growth}🚀
                      {:else if node.type === NodeType.IRL}☕
                      {:else}⚡
                      {/if}
                        </div>
                        
                    <div class="item-details">
                      <div class="item-title">{node.label}</div>
                      <div class="item-meta">
                        <span class="cost">-{node.energyCost}⚡</span>
                        <span class="risk" class:text-red-500={node.risk > 30}>
                          {node.risk > 0 ? `${node.risk}% Risk` : 'Safe'}
                        </span>
                      </div>
                        </div>
                        
                    {#if style.isLocked}
                      <div class="lock-icon">🔒</div>
                    {:else}
                      <div class="run-btn">Run</div>
                    {/if}
                  </button>
                {/each}
                            </div>
                        </div>
                    </div>
                </div>
      {/if}
    {/each}
  </div>
  
  <!-- Fixed UI Elements -->
  
  <!-- YC Application Button (Top Right) -->
  <div class="yc-apply-container">
    <button class="yc-apply-btn" on:click={openYCApplication}>
      <span class="yc-logo">Y</span>
      <span class="yc-text">Apply to YC S24</span>
      <span class="yc-status-dot"></span>
    </button>
  </div>

  <!-- Zoom Controls (Top Left) -->
  <div class="overlay-ui-top-left">
    <div class="minimap-controls">
      <button on:click={() => scale = Math.min(scale + 0.1, 4)}>+</button>
      <div class="scale-display">{Math.round(scale * 100)}%</div>
      <button on:click={() => scale = Math.max(0.1, scale - 0.1)}>-</button>
      <button class="reset-btn" on:click={() => { if(container) { panX = container.clientWidth/2 - 1500; panY = container.clientHeight/2 - 1000; scale = 1; }}}>
        ⟲
      </button>
      </div>
  </div>

</div>

<style>
  :global(body) {
    margin: 0;
    overflow: hidden;
    background: #1a1a1a;
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif;
  }

  .infinite-canvas {
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
    cursor: default;
    background: #0f0f12;
    touch-action: none;
  }

  .grid-background {
    position: absolute;
    inset: 0;
    background-image: 
      linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
    pointer-events: none;
  }

  .transform-layer {
    position: absolute;
    top: 0;
    left: 0;
    transform-origin: 0 0;
    will-change: transform;
  }

  .connections-svg {
    position: absolute;
    top: 0;
    left: 0;
    width: 10000px;
    height: 10000px;
    pointer-events: none;
    overflow: visible;
    z-index: 0;
  }

  /* YC Apply Button */
  .yc-apply-container {
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 2000;
  }

  .yc-apply-btn {
    background: #ff6600;
    color: white;
    border: none;
    padding: 12px 20px;
    border-radius: 8px;
    font-weight: bold;
    font-size: 16px;
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(255, 102, 0, 0.4);
    transition: transform 0.1s, box-shadow 0.1s;
  }

  .yc-apply-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(255, 102, 0, 0.5);
  }

  .yc-apply-btn:active {
    transform: translateY(0);
  }

  .yc-logo {
    background: white;
    color: #ff6600;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    font-family: 'Inter', sans-serif;
    font-size: 14px;
  }

  .yc-status-dot {
    width: 8px;
    height: 8px;
    background: #fff;
    border-radius: 50%;
    animation: blink 2s infinite;
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  /* Controls */
  .overlay-ui-top-left {
    position: absolute;
    top: 20px;
    left: 20px;
    z-index: 2000;
  }

  .minimap-controls {
    background: rgba(30,30,30,0.8);
    backdrop-filter: blur(10px);
    padding: 6px;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    border: 1px solid rgba(255,255,255,0.1);
    box-shadow: 0 4px 20px rgba(0,0,0,0.4);
  }

  .minimap-controls button {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    border: none;
    background: rgba(255,255,255,0.1);
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    transition: background 0.2s;
  }

  .minimap-controls button:hover {
    background: rgba(255,255,255,0.2);
  }

  .reset-btn {
    font-size: 14px !important;
  }

  .scale-display {
    text-align: center;
    color: #aaa;
    font-size: 10px;
    font-weight: 500;
    padding: 2px 0;
  }

  /* Window Styling */
  .mac-window {
    position: absolute;
    background: #fff;
    border-radius: 12px;
    box-shadow: 
      0 20px 60px rgba(0,0,0,0.3),
      0 0 0 1px rgba(0,0,0,0.05);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    transition: box-shadow 0.2s;
  }

  .mac-window:hover {
    box-shadow: 
      0 40px 100px rgba(0,0,0,0.5),
      0 0 0 1px rgba(0,0,0,0.1);
  }

  .mac-window.dark-mode {
    background: #1e1e1e;
    box-shadow: 
      0 20px 60px rgba(0,0,0,0.6),
      0 0 0 1px rgba(255,255,255,0.1);
  }

  .window-header {
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    border-bottom: 1px solid rgba(0,0,0,0.06);
    flex-shrink: 0;
    cursor: grab;
  }
  
  .window-header:active {
    cursor: grabbing;
  }

  .mac-window.dark-mode .window-header {
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }

  .traffic-lights {
    position: absolute;
    left: 14px;
    display: flex;
    gap: 8px;
  }

  .light { width: 12px; height: 12px; border-radius: 50%; }
  .light.close { background: #ff5f57; }
  .light.minimize { background: #febc2e; }
  .light.maximize { background: #28c840; }

  .window-title {
    font-size: 13px;
    font-weight: 600;
    opacity: 0.9;
    pointer-events: none;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .window-favicon {
    width: 16px;
    height: 16px;
    border-radius: 3px;
    object-fit: contain;
  }

  .window-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .browser-bar {
    padding: 8px 12px;
    background: rgba(0,0,0,0.03);
    border-bottom: 1px solid rgba(0,0,0,0.06);
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .mac-window.dark-mode .browser-bar {
    background: rgba(255,255,255,0.03);
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }

  .nav-arrows {
    display: flex;
    gap: 8px;
    color: #888;
    font-size: 14px;
  }

  .url-input {
    flex: 1;
    background: rgba(255,255,255,0.8);
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 6px;
    color: #444;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  }

  .mac-window.dark-mode .url-input {
    background: rgba(0,0,0,0.3);
    color: #bbb;
  }

  .chat-header {
    padding: 12px;
    border-bottom: 1px solid rgba(0,0,0,0.06);
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .mac-window.dark-mode .chat-header {
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }

  .avatar {
    width: 32px;
    height: 32px;
    border-radius: 8px;
  }

  .chat-name { font-weight: 600; font-size: 14px; }
  .chat-status { font-size: 11px; color: #10B981; }

  .scrollable-content {
    flex: 1;
    overflow-y: auto;
    padding: 10px;
  }
  
  .nodes-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .action-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px;
    background: rgba(0,0,0,0.03);
    border-radius: 8px;
    border: 1px solid transparent;
    text-align: left;
    cursor: pointer;
    transition: all 0.2s;
  }

  .mac-window.dark-mode .action-item {
    background: rgba(255,255,255,0.04);
  }

  .action-item:hover:not(:disabled) {
    background: rgba(0,0,0,0.06);
    transform: translateY(-1px);
  }

  .mac-window.dark-mode .action-item:hover:not(:disabled) {
    background: rgba(255,255,255,0.08);
  }

  .action-item.active {
    background: #007AFF;
    color: white;
    box-shadow: 0 4px 12px rgba(0,122,255,0.3);
  }
  
  .action-item.active .item-title,
  .action-item.active .item-meta,
  .action-item.active .cost {
    color: white;
  }

  .item-icon {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    background: rgba(0,0,0,0.1);
  }

  .item-details {
    flex: 1;
    min-width: 0;
  }

  .item-title {
    font-weight: 500;
    font-size: 13px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .item-meta {
    font-size: 11px;
    color: #888;
    margin-top: 2px;
    display: flex;
    gap: 6px;
  }
  
  .mac-window.dark-mode .item-meta { color: #aaa; }

  .run-btn {
    font-size: 11px;
    font-weight: 600;
    color: #007AFF;
    background: rgba(0,122,255,0.1);
    padding: 4px 10px;
    border-radius: 12px;
  }
  
  .mac-window.dark-mode .run-btn {
    color: #0A84FF;
    background: rgba(10,132,255,0.15);
  }
  
  .action-item.active .run-btn {
    background: rgba(255,255,255,0.2);
    color: white;
  }

  .lock-icon { opacity: 0.5; font-size: 12px; }

  .action-item.banned {
    opacity: 0.5;
    background: #421111;
    pointer-events: none;
  }

  .terminal-text {
    font-family: 'Menlo', monospace;
    font-size: 12px;
    color: #2ecc71;
    margin-bottom: 10px;
    line-height: 1.5;
  }
  .prompt { color: #3498db; }
  .error { color: #e74c3c; }
  .success { color: #2ecc71; }

</style>
