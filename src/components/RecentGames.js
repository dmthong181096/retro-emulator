import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { recentGamesManager } from '../services/RecentGames';
import { getConsoleById } from '../config/Config';

const RecentGames = () => {
  const [recentGames, setRecentGames] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const games = recentGamesManager.getRecentGames();
    setRecentGames(games);
  }, []);

  const handleResumeGame = (game) => {
    console.log('🎮 Resuming game:', game);
    navigate(`/emulator/${game.consoleId}`, {
      state: { 
        resumeGame: true,
        gameName: game.gameName,
        consoleType: game.consoleType
      }
    });
  };

  const handleRemoveGame = (gameId, event) => {
    event.stopPropagation();
    recentGamesManager.removeRecentGame(gameId);
    setRecentGames(recentGamesManager.getRecentGames());
  };

  if (recentGames.length === 0) {
    return null;
  }

  return (
    <div className="recent-games-section">
      <h2 className="recent-games-title">
        🕹️ Tiếp tục chơi
      </h2>
      <div className="recent-games-grid">
        {recentGames.map((game) => {
          const console = getConsoleById(game.consoleId);
          return (
            <div 
              key={game.id}
              className="recent-game-card"
              onClick={() => handleResumeGame(game)}
            >
              <div className="recent-game-header">
                <span className="console-icon">{console?.icon || '🎮'}</span>
                <button 
                  className="remove-game-btn"
                  onClick={(e) => handleRemoveGame(game.id, e)}
                  title="Xóa khỏi danh sách"
                >
                  ✕
                </button>
              </div>
              
              <div className="recent-game-info">
                <h3 className="game-name">{game.gameName}</h3>
                <p className="console-name">{console?.name || game.consoleType}</p>
                <div className="game-meta">
                  <span className="last-played">
                    {recentGamesManager.formatLastPlayed(game.lastPlayed)}
                  </span>
                  <span className="play-count">
                    {game.playCount} lần chơi
                  </span>
                </div>
              </div>
              
              <div className="resume-overlay">
                <div className="resume-icon">▶️</div>
                <span>Tiếp tục</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentGames;