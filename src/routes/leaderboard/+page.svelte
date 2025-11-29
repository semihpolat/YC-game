<script>
  import { onMount } from 'svelte';
  import { ArrowLeft, Trophy, Info } from 'lucide-svelte';
  
  let leaderboard = [];
  let loading = true;
  let error = null;
  
  onMount(async () => {
    try {
      const res = await fetch('/api/leaderboard');
      if (!res.ok) throw new Error('Failed to load data');
      leaderboard = await res.json();
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  });
  
  function formatScore(score) {
    if (score >= 1000000) return `$${(score / 1000000).toFixed(1)}M`;
    if (score >= 1000) return `$${(score / 1000).toFixed(0)}K`;
    return `$${score}`;
  }
  
  function getRankEmoji(index) {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  }
</script>

<svelte:head>
  <title>Leaderboard | YC Game</title>
</svelte:head>

<div class="leaderboard-page">
  <div class="container">
    <header class="page-header">
      <a href="/" class="back-link">
        <ArrowLeft size={16} />
        Back to Game
      </a>
      <h1><Trophy size={40} class="inline-block mr-2" /> Leaderboard</h1>
      <p class="subtitle">Top startup founders who made it</p>
    </header>
    
    {#if loading}
      <div class="loading">
        <div class="spinner"></div>
        <p>Loading...</p>
      </div>
    {:else if error}
      <div class="error">
        <p>❌ {error}</p>
      </div>
    {:else if leaderboard.length === 0}
      <div class="empty">
        <p>No entries yet. Be the first!</p>
      </div>
    {:else}
      <div class="leaderboard-table">
        <div class="table-header">
          <span class="col-rank">Rank</span>
          <span class="col-player">Player</span>
          <span class="col-company">Company</span>
          <span class="col-funding">Funding</span>
          <span class="col-employees">Team</span>
          <span class="col-score">Valuation</span>
        </div>
        
        {#each leaderboard as entry, i}
          <div class="table-row" class:top-three={i < 3}>
            <span class="col-rank rank-{i}">{getRankEmoji(i)}</span>
            <span class="col-player">{entry.player_name}</span>
            <span class="col-company">{entry.company_name || '-'}</span>
            <span class="col-funding">{entry.funding_raised || '-'}</span>
            <span class="col-employees">{entry.employees || '-'}</span>
            <span class="col-score">{formatScore(entry.score)}</span>
          </div>
        {/each}
      </div>
    {/if}
    
    <!-- Info Box at the bottom -->
    <div class="info-box">
      <div class="info-icon">
        <Info size={20} />
      </div>
      <div class="info-content">
        <p class="info-title">How to get on the leaderboard</p>
        <p class="info-text">
          Currently, we're adding entries manually. If you've made it to YC in the game, 
          take a screenshot and DM me on X!
        </p>
        <a href="https://x.com/semihpvlat" target="_blank" rel="noopener" class="x-link">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          @semihpvlat
        </a>
      </div>
    </div>
  </div>
</div>

<style>
  .leaderboard-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
    color: white;
    padding: 2rem;
  }
  
  .container {
    max-width: 900px;
    margin: 0 auto;
  }
  
  .page-header {
    text-align: center;
    margin-bottom: 2rem;
  }
  
  .back-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: #ff6600;
    text-decoration: none;
    margin-bottom: 1rem;
    font-size: 0.9rem;
    transition: transform 0.2s;
  }
  
  .back-link:hover {
    transform: translateX(-5px);
  }
  
  h1 {
    font-size: 3rem;
    margin: 0;
    background: linear-gradient(90deg, #ff6600, #ffaa00);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }
  
  h1 :global(svg) {
    color: #ff6600;
    -webkit-text-fill-color: #ff6600;
  }
  
  .subtitle {
    color: #888;
    margin-top: 0.5rem;
  }
  
  /* Info Box */
  .info-box {
    display: flex;
    gap: 1rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 1rem 1.25rem;
    margin-top: 2rem;
  }
  
  .info-icon {
    flex-shrink: 0;
    color: #666;
  }
  
  .info-content {
    flex: 1;
  }
  
  .info-title {
    font-weight: 600;
    font-size: 0.9rem;
    color: #aaa;
    margin: 0 0 0.25rem;
  }
  
  .info-text {
    color: #666;
    font-size: 0.85rem;
    margin: 0 0 0.75rem;
    line-height: 1.5;
  }
  
  .x-link {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    color: #fff;
    background: #000;
    border: 1px solid #333;
    padding: 0.4rem 0.75rem;
    border-radius: 6px;
    text-decoration: none;
    font-size: 0.8rem;
    font-weight: 500;
    transition: all 0.2s;
  }
  
  .x-link:hover {
    background: #1a1a1a;
    border-color: #555;
  }
  
  .loading, .error, .empty {
    text-align: center;
    padding: 4rem;
  }
  
  .spinner {
    width: 50px;
    height: 50px;
    border: 4px solid #333;
    border-top-color: #ff6600;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  .leaderboard-table {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 16px;
    overflow: hidden;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .table-header, .table-row {
    display: grid;
    grid-template-columns: 80px 1fr 1fr 100px 80px 100px;
    padding: 1rem 1.5rem;
    align-items: center;
  }
  
  .table-header {
    background: rgba(255, 102, 0, 0.2);
    font-weight: bold;
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 1px;
    color: #ff6600;
  }
  
  .table-row {
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    transition: background 0.2s;
  }
  
  .table-row:hover {
    background: rgba(255, 255, 255, 0.05);
  }
  
  .table-row:last-child {
    border-bottom: none;
  }
  
  .table-row.top-three {
    background: rgba(255, 102, 0, 0.1);
  }
  
  .col-rank {
    font-size: 1.2rem;
  }
  
  .rank-0 { font-size: 1.5rem; }
  .rank-1 { font-size: 1.4rem; }
  .rank-2 { font-size: 1.3rem; }
  
  .col-player {
    font-weight: 600;
  }
  
  .col-company {
    color: #aaa;
  }
  
  .col-score {
    font-weight: bold;
    color: #4ade80;
    font-size: 1.1rem;
  }
  
  .col-funding, .col-employees {
    color: #888;
    font-size: 0.9rem;
  }
  
  @media (max-width: 768px) {
    .table-header, .table-row {
      grid-template-columns: 50px 1fr 80px;
      font-size: 0.85rem;
    }
    
    .col-company, .col-funding, .col-employees {
      display: none;
    }
    
    h1 {
      font-size: 2rem;
    }
    
    .info-box {
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .info-icon {
      display: none;
    }
  }
</style>
