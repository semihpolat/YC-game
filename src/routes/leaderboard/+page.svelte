<script>
  import { onMount } from 'svelte';
  import { ArrowLeft, Trophy, Twitter, Send } from 'lucide-svelte';
  
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
    
    <!-- Twitter CTA Card -->
    <div class="twitter-card">
      <div class="twitter-header">
        <img 
          src="https://pbs.twimg.com/profile_images/1836107393679917056/S9xpS2s9_400x400.jpg" 
          alt="Semih's profile" 
          class="twitter-avatar"
        />
        <div class="twitter-info">
          <span class="twitter-name">Semih Polat</span>
          <a href="https://x.com/semihpvlat" target="_blank" rel="noopener" class="twitter-handle">
            <Twitter size={14} />
            @semihpvlat
          </a>
        </div>
      </div>
      <div class="twitter-body">
        <p>
          <strong>📢 How to get on the leaderboard:</strong><br/>
          Currently, we're adding entries manually. If you've made it to YC in the game, 
          take a screenshot and DM me on Twitter!
        </p>
        <a href="https://x.com/messages/compose?recipient_id=semihpvlat" target="_blank" rel="noopener" class="twitter-dm-btn">
          <Send size={16} />
          Send me a DM
        </a>
      </div>
    </div>
    
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
  
  /* Twitter Card */
  .twitter-card {
    background: linear-gradient(135deg, rgba(29, 161, 242, 0.1) 0%, rgba(29, 161, 242, 0.05) 100%);
    border: 1px solid rgba(29, 161, 242, 0.3);
    border-radius: 16px;
    padding: 1.5rem;
    margin-bottom: 2rem;
  }
  
  .twitter-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
  }
  
  .twitter-avatar {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    border: 2px solid rgba(29, 161, 242, 0.5);
  }
  
  .twitter-info {
    display: flex;
    flex-direction: column;
  }
  
  .twitter-name {
    font-weight: 700;
    font-size: 1.1rem;
  }
  
  .twitter-handle {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    color: #1da1f2;
    text-decoration: none;
    font-size: 0.9rem;
  }
  
  .twitter-handle:hover {
    text-decoration: underline;
  }
  
  .twitter-body p {
    color: #ccc;
    line-height: 1.6;
    margin-bottom: 1rem;
  }
  
  .twitter-body strong {
    color: white;
  }
  
  .twitter-dm-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: #1da1f2;
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 9999px;
    text-decoration: none;
    font-weight: 600;
    transition: all 0.2s;
  }
  
  .twitter-dm-btn:hover {
    background: #1a91da;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(29, 161, 242, 0.4);
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
    
    .twitter-card {
      padding: 1rem;
    }
    
    .twitter-header {
      flex-direction: column;
      text-align: center;
    }
  }
</style>
