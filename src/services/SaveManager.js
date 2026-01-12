import { supabase } from '../config/supabase';

class SaveManager {
  constructor() {
    this.isEnabled = false;
    this.currentUser = null;
    this.currentGame = null;
    this.currentConsole = null;
  }

  // Initialize save manager with user and game info
  initialize(user, gameName, consoleType) {
    this.isEnabled = !!user;
    this.currentUser = user;
    this.currentGame = gameName;
    this.currentConsole = consoleType;
    
    console.log('💾 SaveManager.initialize called:', {
      enabled: this.isEnabled,
      user: user ? user.email : 'none',
      game: gameName,
      console: consoleType,
      userId: user ? user.id : 'none'
    });
    
    if (this.isEnabled) {
      console.log('✅ Cloud Save Manager initialized successfully');
    } else {
      console.log('❌ Cloud Save Manager disabled - no user');
    }
  }

  // Save state file to Supabase Storage
  async saveToCloud(slotNumber, saveData, screenshot = null) {
    const actualSlot = typeof slotNumber === 'object' ? 
      (slotNumber.slot || slotNumber.id || slotNumber.number || 0) : 
      slotNumber;

    console.log('💾 SaveManager.saveToCloud called:', {
      enabled: this.isEnabled,
      hasUser: !!this.currentUser,
      actualSlot: actualSlot,
      dataType: typeof saveData,
      dataSize: saveData ? saveData.length : 0,
      game: this.currentGame,
      console: this.currentConsole
    });

    if (!this.isEnabled || !this.currentUser) {
      console.warn('💾 Cloud save not available - user not logged in');
      return { success: false, error: 'User not logged in' };
    }

    if (!saveData || saveData.length < 1000) {
      console.warn('💾 Invalid save data');
      return { success: false, error: 'Invalid save data' };
    }

    try {
      // Create simple file name (avoid special characters)
      const gameNameSafe = this.currentGame.replace(/[^a-zA-Z0-9]/g, '_');
      const fileName = `${this.currentUser.id}_${this.currentConsole}_${gameNameSafe}_slot${actualSlot}.state`;
      
      console.log('💾 Uploading file to Supabase Storage:', fileName);

      // Convert Uint8Array to File object
      const file = new File([saveData], fileName, {
        type: 'application/octet-stream'
      });

      // First, try to create bucket if it doesn't exist (will fail silently if exists)
      try {
        await supabase.storage.createBucket('save-states', { public: false });
        console.log('💾 Bucket created or already exists');
      } catch (bucketError) {
        console.log('💾 Bucket creation skipped:', bucketError.message);
      }

      // Upload to Supabase Storage (root level, no folders)
      const { data, error } = await supabase.storage
        .from('save-states')
        .upload(fileName, file, {
          upsert: true // Overwrite if exists
        });

      if (error) {
        console.error('💾 Supabase Storage upload error:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ File uploaded to Supabase Storage:', data);

      // Also save metadata to database (optional, for listing saves)
      try {
        const metadata = {
          user_id: this.currentUser.id,
          game_name: this.currentGame,
          console_type: this.currentConsole,
          slot_number: actualSlot,
          file_path: fileName,
          file_size: saveData.length,
          screenshot: screenshot,
          updated_at: new Date().toISOString()
        };

        const { error: dbError } = await supabase
          .from('save_states')
          .upsert(metadata, {
            onConflict: 'user_id,game_name,console_type,slot_number'
          });

        if (dbError) {
          console.warn('💾 Database metadata save failed:', dbError);
          // File upload succeeded, so this is not critical
        }
      } catch (metaError) {
        console.warn('💾 Metadata save skipped:', metaError.message);
      }

      return { success: true, data };
    } catch (error) {
      console.error('💾 Cloud save exception:', error);
      return { success: false, error: error.message };
    }
  }

  // Load state file from Supabase Storage
  async loadFromCloud(slotNumber) {
    let actualSlot;
    if (slotNumber === undefined || slotNumber === null) {
      actualSlot = 0;
    } else if (typeof slotNumber === 'object') {
      actualSlot = slotNumber.slot || slotNumber.id || slotNumber.number || 0;
    } else {
      actualSlot = slotNumber;
    }

    console.log('💾 SaveManager.loadFromCloud called:', {
      enabled: this.isEnabled,
      hasUser: !!this.currentUser,
      actualSlot: actualSlot,
      game: this.currentGame,
      console: this.currentConsole
    });

    if (!this.isEnabled || !this.currentUser) {
      console.warn('💾 Cloud load not available - user not logged in');
      return { success: false, error: 'User not logged in' };
    }

    try {
      // Create simple file name (same as save)
      const gameNameSafe = this.currentGame.replace(/[^a-zA-Z0-9]/g, '_');
      const fileName = `${this.currentUser.id}_${this.currentConsole}_${gameNameSafe}_slot${actualSlot}.state`;
      
      console.log('💾 Downloading file from Supabase Storage:', fileName);

      // Download from Supabase Storage
      const { data, error } = await supabase.storage
        .from('save-states')
        .download(fileName);

      if (error) {
        console.warn('💾 Supabase Storage download error:', error);
        return { success: false, error: error.message };
      }

      // Convert Blob to ArrayBuffer then to Uint8Array
      const arrayBuffer = await data.arrayBuffer();
      const saveData = new Uint8Array(arrayBuffer);

      console.log('💾 File downloaded from Supabase Storage:', {
        size: saveData.length,
        fileName: fileName
      });

      return { 
        success: true, 
        saveData: saveData,
        fileName: fileName, // Return original filename
        source: 'storage'
      };
    } catch (error) {
      console.error('💾 Cloud load exception:', error);
      return { success: false, error: error.message };
    }
  }

  // List all saves for current game
  async listSaves() {
    if (!this.isEnabled || !this.currentUser) {
      return { success: false, saves: [] };
    }

    try {
      console.log('💾 Listing saves for:', {
        user: this.currentUser.id,
        game: this.currentGame,
        console: this.currentConsole
      });

      const { data, error } = await supabase
        .from('save_states')
        .select('slot_number, file_size, screenshot, created_at, updated_at')
        .eq('user_id', this.currentUser.id)
        .eq('game_name', this.currentGame)
        .eq('console_type', this.currentConsole)
        .order('slot_number');

      if (error) {
        console.error('💾 List saves error:', error);
        return { success: false, saves: [] };
      }

      console.log('💾 Found saves:', data);
      return { success: true, saves: data || [] };
    } catch (error) {
      console.error('💾 List saves exception:', error);
      return { success: false, saves: [] };
    }
  }

  // Delete save from cloud
  async deleteSave(slotNumber) {
    if (!this.isEnabled || !this.currentUser) {
      return { success: false, error: 'User not logged in' };
    }

    try {
      const fileName = `${this.currentUser.id}/${this.currentConsole}/${this.currentGame}/slot_${slotNumber}.state`;

      // Delete from Supabase Storage
      const { error: storageError } = await supabase.storage
        .from('save-states')
        .remove([fileName]);

      if (storageError) {
        console.error('💾 Storage delete error:', storageError);
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('save_states')
        .delete()
        .eq('user_id', this.currentUser.id)
        .eq('game_name', this.currentGame)
        .eq('console_type', this.currentConsole)
        .eq('slot_number', slotNumber);

      if (dbError) {
        console.error('💾 Database delete error:', dbError);
        return { success: false, error: dbError.message };
      }

      console.log('💾 Save deleted from cloud:', {
        game: this.currentGame,
        slot: slotNumber
      });

      return { success: true };
    } catch (error) {
      console.error('💾 Delete save exception:', error);
      return { success: false, error: error.message };
    }
  }
}

// Export singleton instance
export const saveManager = new SaveManager();
export default SaveManager;