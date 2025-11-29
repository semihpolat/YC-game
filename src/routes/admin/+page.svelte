<script>
  import { onMount } from 'svelte';
  
  let authenticated = false;
  let passwordInput = '';
  let passwordError = '';
  
  let leaderboard = [];
  let loading = false;
  let error = null;
  
  // Form state
  let showForm = false;
  let editingId = null;
  let formData = {
    player_name: '',
    company_name: '',
    score: 0,
    funding_raised: '',
    employees: 0
  };
  
  const ADMIN_PASSWORD = 'asdcxz321';
  
  function checkPassword() {
    if (passwordInput === ADMIN_PASSWORD) {
      authenticated = true;
      passwordError = '';
      loadLeaderboard();
    } else {
      passwordError = 'Wrong password!';
    }
  }
  
  async function loadLeaderboard() {
    loading = true;
    try {
      const res = await fetch('/api/leaderboard');
      if (!res.ok) throw new Error('Failed to load data');
      leaderboard = await res.json();
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  }
  
  function openAddForm() {
    editingId = null;
    formData = {
      player_name: '',
      company_name: '',
      score: 0,
      funding_raised: '',
      employees: 0
    };
    showForm = true;
  }
  
  function openEditForm(entry) {
    editingId = entry.id;
    formData = {
      player_name: entry.player_name,
      company_name: entry.company_name || '',
      score: entry.score,
      funding_raised: entry.funding_raised || '',
      employees: entry.employees || 0
    };
    showForm = true;
  }
  
  function closeForm() {
    showForm = false;
    editingId = null;
  }
  
  async function handleSubmit() {
    try {
      const payload = { ...formData, password: ADMIN_PASSWORD };
      
      let res;
      if (editingId) {
        res = await fetch(`/api/leaderboard/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('/api/leaderboard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      
      if (!res.ok) throw new Error('Operation failed');
      
      closeForm();
      await loadLeaderboard();
    } catch (e) {
      alert('Error: ' + e.message);
    }
  }
  
  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    
    try {
      const res = await fetch(`/api/leaderboard/${id}?password=${ADMIN_PASSWORD}`, {
        method: 'DELETE'
      });
      
      if (!res.ok) throw new Error('Delete failed');
      
      await loadLeaderboard();
    } catch (e) {
      alert('Error: ' + e.message);
    }
  }
  
  function formatScore(score) {
    if (score >= 1000000) return `$${(score / 1000000).toFixed(1)}M`;
    if (score >= 1000) return `$${(score / 1000).toFixed(0)}K`;
    return `$${score}`;
  }
</script>

<svelte:head>
  <title>Admin Panel | YC Game</title>
</svelte:head>

<div class="admin-page">
  {#if !authenticated}
    <div class="login-container">
      <div class="login-box">
        <h1>🔐 Admin Login</h1>
        <p>Enter password to manage leaderboard</p>
        
        <form on:submit|preventDefault={checkPassword}>
          <input
            type="password"
            bind:value={passwordInput}
            placeholder="Password"
            class:error={passwordError}
          />
          {#if passwordError}
            <span class="error-text">{passwordError}</span>
          {/if}
          <button type="submit">Login</button>
        </form>
        
        <a href="/" class="back-link">← Back to Home</a>
      </div>
    </div>
  {:else}
    <div class="admin-container">
      <header class="admin-header">
        <div>
          <h1>⚙️ Leaderboard Management</h1>
          <a href="/leaderboard" class="view-link">View Leaderboard →</a>
        </div>
        <button class="btn-add" on:click={openAddForm}>+ Add New</button>
      </header>
      
      {#if loading}
        <div class="loading">Loading...</div>
      {:else if error}
        <div class="error-box">{error}</div>
      {:else}
        <div class="entries-list">
          {#each leaderboard as entry, i}
            <div class="entry-card">
              <div class="entry-rank">#{i + 1}</div>
              <div class="entry-info">
                <div class="entry-name">{entry.player_name}</div>
                <div class="entry-company">{entry.company_name || 'No company specified'}</div>
                <div class="entry-stats">
                  <span>💰 {entry.funding_raised || '-'}</span>
                  <span>👥 {entry.employees || '-'}</span>
                </div>
              </div>
              <div class="entry-score">{formatScore(entry.score)}</div>
              <div class="entry-actions">
                <button class="btn-edit" on:click={() => openEditForm(entry)}>✏️</button>
                <button class="btn-delete" on:click={() => handleDelete(entry.id)}>🗑️</button>
              </div>
            </div>
          {/each}
          
          {#if leaderboard.length === 0}
            <div class="empty-state">
              <p>No entries yet</p>
              <button on:click={openAddForm}>Add first entry</button>
            </div>
          {/if}
        </div>
      {/if}
    </div>
    
    {#if showForm}
      <div class="modal-overlay" on:click={closeForm} on:keydown={(e) => e.key === 'Escape' && closeForm()} role="button" tabindex="0">
        <div class="modal" on:click|stopPropagation on:keydown|stopPropagation role="dialog" aria-modal="true">
          <h2>{editingId ? 'Edit Entry' : 'Add New Entry'}</h2>
          
          <form on:submit|preventDefault={handleSubmit}>
            <label>
              Player Name *
              <input type="text" bind:value={formData.player_name} required />
            </label>
            
            <label>
              Company Name
              <input type="text" bind:value={formData.company_name} />
            </label>
            
            <label>
              Score (Valuation) *
              <input type="number" bind:value={formData.score} required min="0" />
            </label>
            
            <label>
              Funding
              <input type="text" bind:value={formData.funding_raised} placeholder="$1.5M" />
            </label>
            
            <label>
              Team Size
              <input type="number" bind:value={formData.employees} min="0" />
            </label>
            
            <div class="modal-actions">
              <button type="button" class="btn-cancel" on:click={closeForm}>Cancel</button>
              <button type="submit" class="btn-save">Save</button>
            </div>
          </form>
        </div>
      </div>
    {/if}
  {/if}
</div>

<style>
  .admin-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
    color: white;
  }
  
  /* Login */
  .login-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 2rem;
  }
  
  .login-box {
    background: rgba(255, 255, 255, 0.05);
    padding: 3rem;
    border-radius: 16px;
    text-align: center;
    max-width: 400px;
    width: 100%;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .login-box h1 {
    margin: 0 0 0.5rem;
  }
  
  .login-box p {
    color: #888;
    margin-bottom: 2rem;
  }
  
  .login-box form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .login-box input {
    padding: 1rem;
    border: 2px solid #333;
    border-radius: 8px;
    background: rgba(0, 0, 0, 0.3);
    color: white;
    font-size: 1rem;
    text-align: center;
  }
  
  .login-box input.error {
    border-color: #ef4444;
  }
  
  .error-text {
    color: #ef4444;
    font-size: 0.875rem;
  }
  
  .login-box button {
    padding: 1rem;
    background: #ff6600;
    border: none;
    border-radius: 8px;
    color: white;
    font-weight: bold;
    cursor: pointer;
    transition: background 0.2s;
  }
  
  .login-box button:hover {
    background: #ff8533;
  }
  
  .back-link {
    display: inline-block;
    margin-top: 1.5rem;
    color: #888;
    text-decoration: none;
  }
  
  .back-link:hover {
    color: #ff6600;
  }
  
  /* Admin Panel */
  .admin-container {
    max-width: 900px;
    margin: 0 auto;
    padding: 2rem;
  }
  
  .admin-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }
  
  .admin-header h1 {
    margin: 0;
  }
  
  .view-link {
    color: #ff6600;
    text-decoration: none;
    font-size: 0.9rem;
  }
  
  .btn-add {
    padding: 0.75rem 1.5rem;
    background: #ff6600;
    border: none;
    border-radius: 8px;
    color: white;
    font-weight: bold;
    cursor: pointer;
    transition: transform 0.2s;
  }
  
  .btn-add:hover {
    transform: scale(1.05);
  }
  
  /* Entries */
  .entries-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .entry-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    background: rgba(255, 255, 255, 0.05);
    padding: 1rem 1.5rem;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .entry-rank {
    font-size: 1.25rem;
    font-weight: bold;
    color: #ff6600;
    min-width: 50px;
  }
  
  .entry-info {
    flex: 1;
  }
  
  .entry-name {
    font-weight: 600;
    font-size: 1.1rem;
  }
  
  .entry-company {
    color: #888;
    font-size: 0.9rem;
  }
  
  .entry-stats {
    display: flex;
    gap: 1rem;
    margin-top: 0.25rem;
    font-size: 0.85rem;
    color: #666;
  }
  
  .entry-score {
    font-size: 1.25rem;
    font-weight: bold;
    color: #4ade80;
    min-width: 100px;
    text-align: right;
  }
  
  .entry-actions {
    display: flex;
    gap: 0.5rem;
  }
  
  .btn-edit, .btn-delete {
    width: 36px;
    height: 36px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1rem;
    transition: transform 0.2s;
  }
  
  .btn-edit {
    background: #3b82f6;
  }
  
  .btn-delete {
    background: #ef4444;
  }
  
  .btn-edit:hover, .btn-delete:hover {
    transform: scale(1.1);
  }
  
  .empty-state {
    text-align: center;
    padding: 3rem;
    color: #666;
  }
  
  .empty-state button {
    margin-top: 1rem;
    padding: 0.75rem 1.5rem;
    background: #ff6600;
    border: none;
    border-radius: 8px;
    color: white;
    cursor: pointer;
  }
  
  /* Modal */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    z-index: 1000;
  }
  
  .modal {
    background: #1a1a2e;
    padding: 2rem;
    border-radius: 16px;
    max-width: 450px;
    width: 100%;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .modal h2 {
    margin: 0 0 1.5rem;
  }
  
  .modal form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .modal label {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.875rem;
    color: #888;
  }
  
  .modal input {
    padding: 0.75rem;
    border: 1px solid #333;
    border-radius: 8px;
    background: rgba(0, 0, 0, 0.3);
    color: white;
    font-size: 1rem;
  }
  
  .modal input:focus {
    outline: none;
    border-color: #ff6600;
  }
  
  .modal-actions {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
  }
  
  .btn-cancel, .btn-save {
    flex: 1;
    padding: 0.75rem;
    border: none;
    border-radius: 8px;
    font-weight: bold;
    cursor: pointer;
  }
  
  .btn-cancel {
    background: #333;
    color: white;
  }
  
  .btn-save {
    background: #ff6600;
    color: white;
  }
  
  .loading {
    text-align: center;
    padding: 3rem;
    color: #888;
  }
  
  .error-box {
    background: rgba(239, 68, 68, 0.2);
    color: #ef4444;
    padding: 1rem;
    border-radius: 8px;
    text-align: center;
  }
</style>
