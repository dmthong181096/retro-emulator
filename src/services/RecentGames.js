import { romStorage } from './ROMStorage';

class RecentGamesManager {
  constructor() {
    this.storageKey = 'retro_recent_games';
    this.maxRecentGames = 8; // Tăng lên 8 games
  }

  // Add a game to recent games with ROM storage
  async addRecentGame(gameName, consoleType, consoleId, fileInfo = null) {
    try {
      const recentGames = this.getRecentGames();
      
      let romId = null;
      
      // Store ROM file in IndexedDB if provided
      if (fileInfo) {
        try {
          romId = await romStorage.storeROM(fileInfo, gameName, consoleType);
          console.log('✅ ROM stored in IndexedDB:', romId);
        } catch (error) {
          console.error('❌ Failed to store ROM:', error);
          // Continue without ROM storage
        }
      }
      
      // Create game entry
      const gameEntry = {
        id: `${consoleType}_${Date.now()}`,
        gameName: gameName,
        consoleType: consoleType,
        consoleId: consoleId,
        lastPlayed: new Date().toISOString(),
        playCount: 1,
        // ROM storage info
        romId: romId, // ID to retrieve ROM from IndexedDB
        hasStoredROM: !!romId,
        // Keep file info for compatibility
        fileInfo: fileInfo ? {
          name: fileInfo.name,
          size: fileInfo.size,
          lastModified: fileInfo.lastModified,
          type: fileInfo.type,
          path: fileInfo.webkitRelativePath || fileInfo.name,
          fingerprint: this.createFileFingerprint(fileInfo)
        } : null
      };

      // Remove existing entry if it exists
      const existingIndex = recentGames.findIndex(
        game => game.gameName === gameName && game.consoleType === consoleType
      );
      
      if (existingIndex !== -1) {
        // Update existing entry
        const existingGame = recentGames[existingIndex];
        gameEntry.playCount = existingGame.playCount + 1;
        
        // Keep existing ROM ID if new one failed
        if (!romId && existingGame.romId) {
          gameEntry.romId = existingGame.romId;
          gameEntry.hasStoredROM = true;
        }
        
        gameEntry.fileInfo = fileInfo ? gameEntry.fileInfo : existingGame.fileInfo;
        recentGames.splice(existingIndex, 1);
      }

      // Add to beginning of array
      recentGames.unshift(gameEntry);

      // Keep only max recent games
      const trimmedGames = recentGames.slice(0, this.maxRecentGames);

      // Save to localStorage
      localStorage.setItem(this.storageKey, JSON.stringify(trimmedGames));
      
      // Cleanup old ROMs in background
      setTimeout(() => {
        romStorage.cleanup(this.maxRecentGames * 2);
      }, 1000);
      
      return gameEntry;
    } catch (error) {
      console.error('❌ Error adding recent game:', error);
      return null;
    }
  }

  // Try to auto-load ROM from IndexedDB
  async tryAutoLoadROM(gameEntry) {
    if (!gameEntry.hasStoredROM || !gameEntry.romId) {
      return { success: false, reason: 'no_stored_rom' };
    }

    try {
      console.log('🚀 Attempting to load ROM from IndexedDB:', gameEntry.romId);
      
      const romData = await romStorage.getROM(gameEntry.romId);
      
      if (romData) {
        console.log('✅ ROM loaded from IndexedDB:', {
          fileName: romData.metadata.fileName,
          gameName: romData.metadata.gameName,
          fileSize: romData.file.size,
          fileType: romData.file.type
        });
        
        return {
          success: true,
          file: romData.file,
          metadata: romData.metadata,
          method: 'indexeddb',
          reason: 'auto_loaded'
        };
      } else {
        console.log('❌ ROM not found in IndexedDB');
        return { success: false, reason: 'rom_not_found' };
      }
    } catch (error) {
      console.error('❌ Error loading ROM from IndexedDB:', error);
      return { success: false, reason: 'storage_error', error: error.message };
    }
  }

  // Update file handle for a game
  updateGameFileHandle(gameId, fileHandle) {
    try {
      const recentGames = this.getRecentGames();
      const gameIndex = recentGames.findIndex(game => game.id === gameId);
      
      if (gameIndex !== -1 && recentGames[gameIndex].fileInfo) {
        recentGames[gameIndex].fileInfo.fileHandle = fileHandle;
        localStorage.setItem(this.storageKey, JSON.stringify(recentGames));
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Error updating file handle:', error);
      return false;
    }
  }

  // Create a unique fingerprint for file identification
  createFileFingerprint(file) {
    return {
      name: file.name,
      size: file.size,
      lastModified: file.lastModified,
      type: file.type
    };
  }

  // Check if a file matches the stored fingerprint
  isFileMatch(file, fingerprint) {
    if (!file || !fingerprint) return false;
    
    return (
      file.name === fingerprint.name &&
      file.size === fingerprint.size &&
      file.lastModified === fingerprint.lastModified &&
      file.type === fingerprint.type
    );
  }

  // Validate if a recent game's file still exists and matches
  async validateRecentGame(gameEntry, selectedFile = null) {
    if (!gameEntry.fileInfo) {
      return { valid: false, reason: 'no_file_info' };
    }

    // If user provided a file, check if it matches
    if (selectedFile) {
      const matches = this.isFileMatch(selectedFile, gameEntry.fileInfo.fingerprint);
      return { 
        valid: matches, 
        reason: matches ? 'file_match' : 'file_mismatch',
        file: matches ? selectedFile : null
      };
    }

    // For now, we can't auto-validate without File System Access API
    // But we can provide the file info for user to manually select
    return { 
      valid: false, 
      reason: 'needs_manual_selection',
      expectedFile: gameEntry.fileInfo
    };
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

  // Get games that have file info (can potentially be auto-loaded)
  getAutoLoadableGames() {
    const allGames = this.getRecentGames();
    return allGames.filter(game => game.fileInfo);
  }

  // Update file info for an existing game
  updateGameFileInfo(gameId, fileInfo) {
    try {
      const recentGames = this.getRecentGames();
      const gameIndex = recentGames.findIndex(game => game.id === gameId);
      
      if (gameIndex !== -1) {
        recentGames[gameIndex].fileInfo = {
          name: fileInfo.name,
          size: fileInfo.size,
          lastModified: fileInfo.lastModified,
          type: fileInfo.type,
          path: fileInfo.webkitRelativePath || fileInfo.name,
          fingerprint: this.createFileFingerprint(fileInfo)
        };
        
        localStorage.setItem(this.storageKey, JSON.stringify(recentGames));
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Error updating game file info:', error);
      return false;
    }
  }

  // Check if user has any recent games with file references
  hasAutoLoadableGames() {
    return this.getAutoLoadableGames().length > 0;
  }

  // Get file size in human readable format
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Clean up old games without file info (optional maintenance)
  cleanupOldGames() {
    try {
      const recentGames = this.getRecentGames();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 30); // 30 days ago
      
      const cleanedGames = recentGames.filter(game => {
        // Keep games with file info or games played recently
        return game.fileInfo || new Date(game.lastPlayed) > cutoffDate;
      });
      
      if (cleanedGames.length !== recentGames.length) {
        localStorage.setItem(this.storageKey, JSON.stringify(cleanedGames));
        return recentGames.length - cleanedGames.length; // Number of games removed
      }
      
      return 0;
    } catch (error) {
      console.error('❌ Error cleaning up old games:', error);
      return 0;
    }
  }

  // Get statistics about recent games
  getGameStats() {
    const allGames = this.getRecentGames();
    const autoLoadableGames = this.getAutoLoadableGames();
    
    return {
      total: allGames.length,
      autoLoadable: autoLoadableGames.length,
      withoutFileInfo: allGames.length - autoLoadableGames.length,
      totalPlayCount: allGames.reduce((sum, game) => sum + game.playCount, 0)
    };
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