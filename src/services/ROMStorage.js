// ROM Storage using IndexedDB for true auto-loading
class ROMStorage {
  constructor() {
    this.dbName = 'RetroEmulatorROMs';
    this.dbVersion = 1;
    this.storeName = 'roms';
    this.db = null;
  }

  // Initialize IndexedDB
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object store for ROMs
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          store.createIndex('gameName', 'gameName', { unique: false });
          store.createIndex('consoleType', 'consoleType', { unique: false });
          store.createIndex('lastAccessed', 'lastAccessed', { unique: false });
        }
      };
    });
  }

  // Store ROM file in IndexedDB
  async storeROM(file, gameName, consoleType) {
    if (!this.db) await this.init();
    
    // Validate input
    if (!file || !file.name) {
      throw new Error('Invalid file object - missing name');
    }
    
    if (!gameName || !consoleType) {
      throw new Error('Missing gameName or consoleType');
    }
    
    console.log('📥 Input validation passed:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      gameName: gameName,
      consoleType: consoleType
    });
    
    try {
      // Create unique ID for ROM
      const romId = `${consoleType}_${gameName}_${Date.now()}`;
      
      // Convert file to ArrayBuffer for storage
      const arrayBuffer = await file.arrayBuffer();
      
      const romData = {
        id: romId,
        gameName: gameName,
        consoleType: consoleType,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        lastModified: file.lastModified,
        lastAccessed: Date.now(),
        data: arrayBuffer
      };

      console.log('💾 Storing ROM data:', {
        id: romId,
        gameName: gameName,
        consoleType: consoleType,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        dataSize: arrayBuffer.byteLength
      });

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        
        // Remove existing ROM for same game
        const gameIndex = store.index('gameName');
        const getRequest = gameIndex.getAll(gameName);
        
        getRequest.onsuccess = () => {
          const existingROMs = getRequest.result.filter(rom => rom.consoleType === consoleType);
          
          // Delete existing ROMs for this game
          existingROMs.forEach(rom => {
            store.delete(rom.id);
          });
          
          // Add new ROM
          const addRequest = store.add(romData);
          addRequest.onsuccess = () => resolve(romId);
          addRequest.onerror = () => reject(addRequest.error);
        };
        
        getRequest.onerror = () => reject(getRequest.error);
      });
    } catch (error) {
      console.error('Error storing ROM:', error);
      throw error;
    }
  }

  // Retrieve ROM file from IndexedDB
  async getROM(romId) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(romId);
      
      request.onsuccess = () => {
        const romData = request.result;
        console.log('🔍 Retrieved ROM data from IndexedDB:', romData);
        
        if (romData) {
          // Update last accessed time
          this.updateLastAccessed(romId);
          
          // Debug log the file data
          console.log('🔍 ROM file data:', {
            fileName: romData.fileName,
            fileType: romData.fileType,
            fileSize: romData.fileSize,
            dataSize: romData.data ? romData.data.byteLength : 'no data'
          });
          
          // Convert ArrayBuffer back to File
          const fileName = romData.fileName || `${romData.gameName || 'unknown'}.rom`;
          const fileType = romData.fileType || 'application/octet-stream';
          const lastModified = romData.lastModified || Date.now();
          
          const file = new File([romData.data], fileName, {
            type: fileType,
            lastModified: lastModified
          });
          
          console.log('🔍 Created File object:', {
            name: file.name,
            size: file.size,
            type: file.type
          });
          
          resolve({
            file: file,
            metadata: {
              id: romData.id,
              gameName: romData.gameName,
              consoleType: romData.consoleType,
              fileSize: romData.fileSize,
              lastAccessed: romData.lastAccessed,
              fileName: romData.fileName // Add this for debugging
            }
          });
        } else {
          console.log('❌ No ROM data found for ID:', romId);
          resolve(null);
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  // Update last accessed time
  async updateLastAccessed(romId) {
    if (!this.db) await this.init();
    
    const transaction = this.db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);
    
    const getRequest = store.get(romId);
    getRequest.onsuccess = () => {
      const romData = getRequest.result;
      if (romData) {
        romData.lastAccessed = Date.now();
        store.put(romData);
      }
    };
  }

  // Get all stored ROMs
  async getAllROMs() {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();
      
      request.onsuccess = () => {
        const roms = request.result.map(rom => ({
          id: rom.id,
          gameName: rom.gameName,
          consoleType: rom.consoleType,
          fileName: rom.fileName,
          fileSize: rom.fileSize,
          lastAccessed: rom.lastAccessed
        }));
        resolve(roms);
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  // Delete ROM from storage
  async deleteROM(romId) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(romId);
      
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  // Get storage usage info
  async getStorageInfo() {
    if (!this.db) await this.init();
    
    const roms = await this.getAllROMs();
    const totalSize = roms.reduce((sum, rom) => sum + rom.fileSize, 0);
    
    return {
      romCount: roms.length,
      totalSize: totalSize,
      formattedSize: this.formatFileSize(totalSize)
    };
  }

  // Format file size
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Clean up old ROMs (keep only recent ones)
  async cleanup(maxROMs = 10) {
    if (!this.db) await this.init();
    
    const roms = await this.getAllROMs();
    
    if (roms.length > maxROMs) {
      // Sort by last accessed (oldest first)
      roms.sort((a, b) => a.lastAccessed - b.lastAccessed);
      
      // Delete oldest ROMs
      const romsToDelete = roms.slice(0, roms.length - maxROMs);
      
      for (const rom of romsToDelete) {
        await this.deleteROM(rom.id);
      }
      
      return romsToDelete.length;
    }
    
    return 0;
  }
}

// Export singleton instance
export const romStorage = new ROMStorage();
export default ROMStorage;