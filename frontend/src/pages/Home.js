import {
    Box,
    Button,
    Container,
    Paper,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState(localStorage.getItem('playerName') || '');
  const [gameId, setGameId] = useState('');
  const [error, setError] = useState('');

  const createGame = async () => {
    try {
      if (!playerName) {
        setError('Please enter your name');
        return;
      }
      
      // Store player name
      localStorage.setItem('playerName', playerName);
      
      // Create a new game
      const gameResponse = await axios.post('http://localhost:8000/api/games/create/');
      const game = gameResponse.data;
      
      // Add the player to the game
      await axios.post('http://localhost:8000/api/players/add/', {
        name: playerName,
        game: game.id
      });
      
      // Navigate to the game lobby
      navigate(`/game/${game.id}`);
    } catch (err) {
      setError('Failed to create game. Please try again.');
      console.error(err);
    }
  };

  const joinGame = async () => {
    try {
      if (!playerName || !gameId) {
        setError('Please enter your name and game ID');
        return;
      }
      
      // Store player name
      localStorage.setItem('playerName', playerName);
      
      // Add the player to the existing game
      await axios.post('http://localhost:8000/api/players/add/', {
        name: playerName,
        game: parseInt(gameId)
      });
      
      // Navigate to the game lobby
      navigate(`/game/${gameId}`);
    } catch (err) {
      setError('Failed to join game. Please check the game ID and try again.');
      console.error(err);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Just One
        </Typography>
        <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Your Name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              error={!!error && !playerName}
              helperText={error && !playerName ? error : ''}
            />
            
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={createGame}
              fullWidth
            >
              Create New Game
            </Button>
            
            <Typography variant="h6">OR</Typography>
            
            <TextField
              fullWidth
              label="Game ID"
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              error={!!error && !gameId}
              helperText={error && !gameId ? error : ''}
            />
            
            <Button
              variant="outlined"
              color="primary"
              size="large"
              onClick={joinGame}
              fullWidth
            >
              Join Game
            </Button>
          </Stack>
        </Paper>
      </Box>
    </Container>
  );
};

export default Home; 