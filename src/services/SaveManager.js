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
    
    if (this.isEnabled) {
      // Cloud Save Manager initialized successfully
    } else {
      // Cloud Save Manager disabled - no user
    }
  }

  // Save state file to Supabase Storage
  async saveToCloud(slotNumber, saveData, screenshot = null) {
    const actualSlot = typeof slotNumber === 'object' ? 
      (slotNumber.slot || slotNumber.id || slotNumber.number || 0) : 
      slotNumber;

    if (!this.isEnabled || !this.currentUser) {
      return { success: false, error: 'User not logged in' };
    }

    if (!saveData || saveData.length < 1000) {
      return { success: false, error: 'Invalid save data' };
    }

    try {
      // Create simple file name (avoid special characters)
      const gameNameSafe = this.currentGame.replace(/[^a-zA-Z0-9]/g, '_');
      const fileName = `${this.currentUser.id}_${this.currentConsole}_${gameNameSafe}_slot${actualSlot}.state`;

      // Convert Uint8Array to File object
      const file = new File([saveData], fileName, {
        type: 'application/octet-stream'
      });

      // First, check if bucket exists, if not create it
      try {
        // Try to list files in bucket to check if it exists
        const { data: bucketData, error: bucketCheckError } = await supabase.storage
          .from('save-states')
          .list('', { limit: 1 });

        // If bucket doesn't exist, create it
        if (bucketCheckError && bucketCheckError.message.includes('not found')) {
          console.log('📦 Creating save-states bucket...');
          const { data: createData, error: createError } = await supabase.storage
            .createBucket('save-states', { 
              public: false,
              allowedMimeTypes: ['application/octet-stream'],
              fileSizeLimit: 10485760 // 10MB limit
            });
          
          if (createError) {
            console.log('❌ Bucket creation failed:', createError);
            // Continue anyway, bucket might already exist
          } else {
            console.log('✅ Bucket created successfully');
          }
        } else if (bucketCheckError) {
          console.log('⚠️ Bucket check error:', bucketCheckError);
          // Continue anyway
        } else {
          console.log('✅ Bucket exists, proceeding with upload');
        }
      } catch (bucketError) {
        console.log('⚠️ Bucket operation error:', bucketError);
        // Continue anyway
      }

      // Upload to Supabase Storage (root level, no folders)
      console.log('📤 Uploading save file:', fileName);
      const { data, error } = await supabase.storage
        .from('save-states')
        .upload(fileName, file, {
          upsert: true // Overwrite if exists
        });

      if (error) {
        console.log('❌ Upload error:', error);
        
        // Check for specific error types
        if (error.message.includes('not found')) {
          return { success: false, error: 'Storage bucket not found. Please check Supabase configuration.' };
        } else if (error.message.includes('permission')) {
          return { success: false, error: 'Permission denied. Please check storage policies.' };
        } else if (error.message.includes('size')) {
          return { success: false, error: 'File too large. Maximum size is 10MB.' };
        } else {
          return { success: false, error: `Upload failed: ${error.message}` };
        }
      }

      console.log('✅ Upload successful:', data);

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
          // Database metadata save failed - File upload succeeded, so this is not critical
        }
      } catch (metaError) {
        // Metadata save skipped
      }

      return { success: true, data };
    } catch (error) {
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

    if (!this.isEnabled || !this.currentUser) {
      return { success: false, error: 'User not logged in' };
    }

    try {
      // Create simple file name (same as save)
      const gameNameSafe = this.currentGame.replace(/[^a-zA-Z0-9]/g, '_');
      const fileName = `${this.currentUser.id}_${this.currentConsole}_${gameNameSafe}_slot${actualSlot}.state`;

      // Download from Supabase Storage
      const { data, error } = await supabase.storage
        .from('save-states')
        .download(fileName);

      if (error) {
        return { success: false, error: error.message };
      }

      // Convert Blob to ArrayBuffer then to Uint8Array
      const arrayBuffer = await data.arrayBuffer();
      const saveData = new Uint8Array(arrayBuffer);

      return { 
        success: true, 
        saveData: saveData,
        fileName: fileName, // Return original filename
        source: 'storage'
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // List all saves for current game
  async listSaves() {
    if (!this.isEnabled || !this.currentUser) {
      return { success: false, saves: [] };
    }

    try {
      const { data, error } = await supabase
        .from('save_states')
        .select('slot_number, file_size, screenshot, created_at, updated_at')
        .eq('user_id', this.currentUser.id)
        .eq('game_name', this.currentGame)
        .eq('console_type', this.currentConsole)
        .order('slot_number');

      if (error) {
        return { success: false, saves: [] };
      }

      return { success: true, saves: data || [] };
    } catch (error) {
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
        // Storage delete error
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
        return { success: false, error: dbError.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Export singleton instance
export const saveManager = new SaveManager();
export default SaveManager;