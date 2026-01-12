class RecentGamesManager {
  constructor() {
    this.storageKey = 'retro_recent_games';
    this.maxRecentGames = 5;
  }

  // Add a game to recent games
  addRecentGame(gameName, consoleType, consoleId) {
    try {
      const recentGames = this.getRecentGames();
      
      // Create game entry
      const gameEntry = {
        id: `${consoleType}_${Date.now()}`,
        gameName: gameName,
        consoleType: consoleType,
        consoleId: consoleId,
        lastPlayed: new Date().toISOString(),
        playCount: 1
      };

      // Remove existing entry if it exists
      const existingIndex = recentGames.findIndex(
        game => game.gameName === gameName && game.consoleType === consoleType
      );
      
      if (existingIndex !== -1) {
        // Update existing entry
        gameEntry.playCount = recentGames[existingIndex].playCount + 1;
        recentGames.splice(existingIndex, 1);
      }

      // Add to beginning of array
      recentGames.unshift(gameEntry);

      // Keep only max recent games
      const trimmedGames = recentGames.slice(0, this.maxRecentGames);

      // Save to localStorage
      localStorage.setItem(this.storageKey, JSON.stringify(trimmedGames));
      
      return gameEntry;
    } catch (error) {
      console.error('❌ Error adding recent game:', error);
      return null;
    }
  }

  // Get all recent games
  getRecentGames() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('❌ Error getting recent games:', error);
      return [];
    }
  }

  // Remove a game from recent games
  removeRecentGame(gameId) {
    try {
      const recentGames = this.getRecentGames();
      const filteredGames = recentGames.filter(game => game.id !== gameId);
      localStorage.setItem(this.storageKey, JSON.stringify(filteredGames));
    } catch (error) {
      console.error('❌ Error removing recent game:', error);
    }
  }

  // Clear all recent games
  clearRecentGames() {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.error('❌ Error clearing recent games:', error);
    }
  }

  // Get recent games for a specific console
  getRecentGamesForConsole(consoleType) {
    const allGames = this.getRecentGames();
    return allGames.filter(game => game.consoleType === consoleType);
  }

  // Format last played time
  formatLastPlayed(lastPlayed) {
    try {
      const date = new Date(lastPlayed);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Vừa xong';
      if (diffMins < 60) return `${diffMins} phút trước`;
      if (diffHours < 24) return `${diffHours} giờ trước`;
      if (diffDays < 7) return `${diffDays} ngày trước`;
      
      return date.toLocaleDateString('vi-VN');
    } catch (error) {
      return 'Không rõ';
    }
  }
}

// Export singleton instance
export const recentGamesManager = new RecentGamesManager();
export default RecentGamesManager;