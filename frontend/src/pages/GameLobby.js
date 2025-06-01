import {
    Alert,
    Box,
    Button,
    Container,
    Divider,
    List,
    ListItem,
    ListItemText,
    Paper,
    Typography,
} from '@mui/material';
import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const GameLobby = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [players, setPlayers] = useState([]);
  const [error, setError] = useState('');

  // Fetch game and players data
  const fetchGameData = useCallback(async () => {
    try {
      const [gameResponse, playersResponse] = await Promise.all([
        axios.get(`http://localhost:8000/api/games/`),
        axios.get(`http://localhost:8000/api/players/`)
      ]);

      const currentGame = gameResponse.data.find(g => g.id === parseInt(gameId));
      const gamePlayers = playersResponse.data.filter(p => p.game === parseInt(gameId));
      
      setGame(currentGame);
      setPlayers(gamePlayers);

      // If game has started, redirect to game play
      if (currentGame && currentGame.started) {
        navigate(`/game/${gameId}/play`);
      }
    } catch (err) {
      setError('Failed to fetch game data');
      console.error(err);
    }
  }, [gameId, navigate]);

  // Fetch data initially and set up polling
  useEffect(() => {
    fetchGameData();
    const interval = setInterval(fetchGameData, 3000);
    return () => clearInterval(interval);
  }, [fetchGameData]);

  const startGame = async () => {
    try {
      await axios.post(`http://localhost:8000/api/games/${gameId}/start/`);
      navigate(`/game/${gameId}/play`);
    } catch (err) {
      setError('Failed to start game. ' + (err.response?.data?.error || 'Please try again.'));
      console.error(err);
    }
  };

  if (!game) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <Typography>Loading game...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h3" gutterBottom>
          Game Lobby
        </Typography>
        
        <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Game ID: {gameId}
          </Typography>
          
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Players ({players.length}/13):
            </Typography>
            <List>
              {players.map((player, index) => (
                <React.Fragment key={player.id}>
                  <ListItem>
                    <ListItemText primary={player.name} />
                  </ListItem>
                  {index < players.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Box>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Game Rules:
            </Typography>
            <Alert severity="info" sx={{ textAlign: 'left' }}>
              <Typography variant="body2">
                1. The game consists of 13 rounds.
              </Typography>
              <Typography variant="body2">
                2. Each round:
                <ul>
                  <li>A guesser is randomly selected</li>
                  <li>The guesser chooses 1 of 5 mystery words</li>
                  <li>Other players write one-word clues</li>
                  <li>Duplicate or invalid clues are removed</li>
                  <li>The guesser tries to guess the word</li>
                </ul>
              </Typography>
              <Typography variant="body2">
                3. Clue Rules:
                <ul>
                  <li>Must be a single word</li>
                  <li>Cannot be the mystery word or from its word family</li>
                  <li>Cannot be phonetically identical</li>
                  <li>Cannot match another player's clue</li>
                </ul>
              </Typography>
            </Alert>
          </Box>

          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}

          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={startGame}
            fullWidth
            sx={{ mt: 4 }}
            disabled={players.length < 3}
          >
            {players.length < 3 
              ? `Need ${3 - players.length} more player${3 - players.length === 1 ? '' : 's'}`
              : 'Start Game'
            }
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default GameLobby; 