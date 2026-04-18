import { supabase } from '../config/supabase';

class ContentSaveManager {
  constructor() {
    this.currentUser = null;
    this.currentGame = null;
    this.currentConsole = null;
  }

  // Initialize with user and game info
  initialize(user, gameName, consoleType) {
    this.currentUser = user;
    this.currentGame = gameName;
    this.currentConsole = consoleType;
    console.log('🎮 ContentSaveManager initialized:', {
      userId: user?.id,
      game: gameName,
      console: consoleType
    });
  }

  // Save content to database (not storage)
  async saveContentToCloud(slot = 0, saveData) {
    if (!this.currentUser) {
      return { success: false, error: 'User not logged in' };
    }

    if (!saveData || saveData.length === 0) {
      return { success: false, error: 'No save data provided' };
    }

    try {
      console.log('💾 Saving content to database...');
      console.log('- Data size:', saveData.length, 'bytes');
      console.log('- User:', this.currentUser.id);
      console.log('- Game:', this.currentGame);

      // Convert Uint8Array to base64 string for database storage
      const base64Content = btoa(String.fromCharCode.apply(null, saveData));
      console.log('- Base64 size:', base64Content.length, 'chars');

      // Create save record in database
      const saveRecord = {
        user_id: this.currentUser.id,
        game_name: this.currentGame,
        console_type: this.currentConsole,
        slot_number: slot,
        save_content: base64Content, // Store as base64 string
        content_size: saveData.length,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Upsert to database (insert or update if exists)
      const { data, error } = await supabase
        .from('save_states_content')
        .upsert(saveRecord, {
          onConflict: 'user_id,game_name,console_type,slot_number'
        })
        .select();

      if (error) {
        console.log('❌ Database save error:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Content saved to database:', data);
      return { 
        success: true, 
        data: data[0],
        method: 'database_content',
        size: base64Content.length
      };

    } catch (error) {
      console.error('❌ Content save error:', error);
      return { success: false, error: error.message };
    }
  }

  // Load content from database
  async loadContentFromCloud(slot = 0) {
    if (!this.currentUser) {
      return { success: false, error: 'User not logged in' };
    }

    try {
      console.log('📥 Loading content from database...');
      console.log('- User:', this.currentUser.id);
      console.log('- Game:', this.currentGame);
      console.log('- Slot:', slot);

      // Query database for save content
      const { data, error } = await supabase
        .from('save_states_content')
        .select('*')
        .eq('user_id', this.currentUser.id)
        .eq('game_name', this.currentGame)
        .eq('console_type', this.currentConsole)
        .eq('slot_number', slot)
        .single();

      if (error) {
        console.log('❌ Database load error:', error);
        if (error.code === 'PGRST116') {
          return { success: false, error: 'No save data found for this game' };
        }
        return { success: false, error: error.message };
      }

      if (!data || !data.save_content) {
        return { success: false, error: 'No save content found' };
      }

      console.log('✅ Content loaded from database:', {
        contentSize: data.content_size,
        base64Size: data.save_content.length,
        createdAt: data.created_at
      });

      // Convert base64 back to Uint8Array
      const binaryString = atob(data.save_content);
      const saveData = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        saveData[i] = binaryString.charCodeAt(i);
      }

      return { 
        success: true, 
        saveData: saveData,
        metadata: {
          contentSize: data.content_size,
          createdAt: data.created_at,
          updatedAt: data.updated_at
        },
        method: 'database_content'
      };

    } catch (error) {
      console.error('❌ Content load error:', error);
      return { success: false, error: error.message };
    }
  }

  // List all saves for current user and game
  async listContentSaves() {
    if (!this.currentUser) {
      return { success: false, error: 'User not logged in' };
    }

    try {
      const { data, error } = await supabase
        .from('save_states_content')
        .select('slot_number, content_size, created_at, updated_at')
        .eq('user_id', this.currentUser.id)
        .eq('game_name', this.currentGame)
        .eq('console_type', this.currentConsole)
        .order('slot_number');

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, saves: data || [] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Delete a save
  async deleteContentSave(slot = 0) {
    if (!this.currentUser) {
      return { success: false, error: 'User not logged in' };
    }

    try {
      const { error } = await supabase
        .from('save_states_content')
        .delete()
        .eq('user_id', this.currentUser.id)
        .eq('game_name', this.currentGame)
        .eq('console_type', this.currentConsole)
        .eq('slot_number', slot);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Export singleton instance
export const contentSaveManager = new ContentSaveManager();
export default ContentSaveManager;