import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const GamePlay = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [players, setPlayers] = useState([]);
  const [guess, setGuess] = useState('');
  const [clue, setClue] = useState('');
  const [error, setError] = useState('');
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [allCluesSubmitted, setAllCluesSubmitted] = useState(false);
  const [hasSubmittedClue, setHasSubmittedClue] = useState(false);
  const [selectedWordIndex, setSelectedWordIndex] = useState(null);

  // Fetch game and players data
  const fetchGameData = useCallback(async () => {
    try {
      const [gameStateResponse, playersResponse] = await Promise.all([
        axios.get(`http://localhost:8000/api/games/${gameId}/state/`),
        axios.get(`http://localhost:8000/api/players/`)
      ]);

      const currentGame = gameStateResponse.data;
      const gamePlayers = playersResponse.data.filter(p => p.game === parseInt(gameId));
      
      // If game hasn't started, redirect back to lobby
      if (currentGame && !currentGame.started) {
        navigate(`/game/${gameId}`);
        return;
      }

      // Ensure word_options is always an array
      if (currentGame) {
        currentGame.word_options = currentGame.word_options || [];
        currentGame.clues = currentGame.clues || [];
      }

      setGame(currentGame);
      setPlayers(gamePlayers);
      setAllCluesSubmitted(currentGame.all_clues_submitted);

      // Find current player based on stored name
      const playerName = localStorage.getItem('playerName');
      const player = gamePlayers.find(p => p.name === playerName);
      setCurrentPlayer(player);

      // Check if current player has submitted a clue for this round
      if (player && currentGame.clues) {
        const playerClue = currentGame.clues.find(c => c.player === player.id);
        // Player has submitted if they have any clue (valid or invalid)
        setHasSubmittedClue(Boolean(playerClue));
      }

      // Debug logs
      console.log('Current Game:', currentGame);
      console.log('Current Player:', player);
      console.log('Is Guesser:', player && currentGame.guesser_id === player.id);
      console.log('Has Submitted Clue:', hasSubmittedClue);
      console.log('All Clues:', currentGame.clues);
    } catch (err) {
      setError('Failed to fetch game data');
      console.error(err);
    }
  }, [gameId, navigate, hasSubmittedClue]);

  useEffect(() => {
    fetchGameData();
    const interval = setInterval(fetchGameData, 3000);
    return () => clearInterval(interval);
  }, [fetchGameData]);

  const selectWord = async (index) => {
    try {
      await axios.post(`http://localhost:8000/api/games/${gameId}/select-word/`, {
        word_index: index
      });
      setSelectedWordIndex(index);
      fetchGameData();
    } catch (err) {
      setError('Failed to select word');
      console.error(err);
    }
  };

  const submitGuess = async () => {
    try {
      const response = await axios.post('http://localhost:8000/api/guess/', {
        game: parseInt(gameId),
        player: currentPlayer.id,
        guess: guess
      });
      
      const result = response.data.guess_result;
      setGuess('');
      
      // Show result and handle round completion
      if (result.correct) {
        setError('');
        alert(`Correct! The word was "${result.mystery_word}"`);
      } else {
        alert(`Incorrect. The word was "${result.mystery_word}"`);
      }
      
      // If game is complete, show final score
      if (response.data.game_complete) {
        alert(`Game Over! Final Score: ${response.data.score}/13`);
        navigate('/');
      } else {
        // Start next round
        await axios.post(`http://localhost:8000/api/games/${gameId}/next-round/`);
        setSelectedWordIndex(null); // Reset selected word index
        setHasSubmittedClue(false); // Reset clue submission state
        setAllCluesSubmitted(false); // Reset all clues submitted state
        fetchGameData();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit guess');
      console.error(err);
    }
  };

  const submitClue = async () => {
    try {
      const response = await axios.post('http://localhost:8000/api/clues/', {
        game: parseInt(gameId),
        player: currentPlayer.id,
        word: clue
      });
      setClue('');
      setHasSubmittedClue(true);
      setAllCluesSubmitted(response.data.all_clues_submitted);
      setError('');
      fetchGameData();
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to submit clue';
      setError(errorMessage);
      console.error(err);
    }
  };

  if (!game || !currentPlayer) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <Typography>Loading game...</Typography>
        </Box>
      </Container>
    );
  }

  // Fix guesser comparison using guesser_id
  const isGuesser = currentPlayer && game.guesser_id && currentPlayer.id === game.guesser_id;
  const nonGuesserCount = players.filter(p => p.id !== game.guesser_id).length;
  const clueCount = game.clues ? game.clues.length : 0;
  const wordOptions = Array.isArray(game.word_options) ? game.word_options : [];

  // Add debug display
  console.log('Game State:', {
    currentPlayerId: currentPlayer.id,
    guesserId: game.guesser_id,
    isGuesser,
    players: players.map(p => ({ id: p.id, name: p.name }))
  });

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h3" gutterBottom>
          Just One
        </Typography>
        
        <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 4 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Game ID: {gameId} | Round: {game.current_round}/13 | Score: {game.score}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {isGuesser ? "You are the guesser" : "You are giving clues"}
            </Typography>
          </Box>

          {isGuesser ? (
            <>
              <Typography variant="h5" sx={{ mt: 4, color: 'primary.main' }}>
                You are the guesser!
              </Typography>
              
              {!game.mystery_word && wordOptions.length > 0 && (
                <>
                  <Typography variant="h6" sx={{ mt: 2 }}>
                    Choose a number between 1-5 to select the mystery word:
                  </Typography>
                  <Grid container spacing={2} sx={{ mt: 2, mb: 4 }}>
                    {wordOptions.map((_, index) => (
                      <Grid item xs={2.4} key={index}>
                        <Button
                          variant="contained"
                          fullWidth
                          onClick={() => selectWord(index)}
                          disabled={selectedWordIndex !== null}
                        >
                          {index + 1}
                        </Button>
                      </Grid>
                    ))}
                  </Grid>
                </>
              )}
              
              {game.mystery_word && !allCluesSubmitted && (
                <Typography variant="body1" sx={{ mt: 2 }}>
                  Waiting for clues... ({game.clues?.filter(c => c.is_valid).length || 0} submitted)
                </Typography>
              )}

              {allCluesSubmitted && (
                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    All clues are in! Make your guess:
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    {game.clues && game.clues.length > 0 && (
                      <Grid container spacing={2} sx={{ mb: 4 }}>
                        {game.clues
                          .filter(c => c.is_valid)
                          .map((clue) => (
                            <Grid item xs={4} key={clue.id}>
                              <Card>
                                <CardContent>
                                  <Typography variant="h5">{clue.word}</Typography>
                                  <Typography variant="body2" color="textSecondary">
                                    by {clue.player_name}
                                  </Typography>
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                      </Grid>
                    )}
                    <TextField
                      fullWidth
                      label="Your Guess"
                      value={guess}
                      onChange={(e) => setGuess(e.target.value)}
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      size="large"
                      onClick={submitGuess}
                      fullWidth
                      sx={{ mt: 2 }}
                      disabled={!guess}
                    >
                      Submit Guess
                    </Button>
                  </Box>
                </Box>
              )}
            </>
          ) : (
            <>
              <Typography variant="h5" sx={{ mt: 4, color: 'primary.main' }}>
                Mystery Word: {game.mystery_word}
              </Typography>
              <Alert severity="info" sx={{ mt: 2 }}>
                Remember: Your clue must be unique and follow these rules:
                <ul>
                  <li>Must be a single word</li>
                  <li>Cannot be the mystery word or from the same word family</li>
                  <li>Cannot be phonetically identical to the mystery word</li>
                  <li>Cannot be the same as another player's clue (if duplicates occur, both clues are removed)</li>
                </ul>
              </Alert>
              {!hasSubmittedClue && game.mystery_word && (
                <Box sx={{ mt: 4 }}>
                  <TextField
                    fullWidth
                    label="Your Clue"
                    value={clue}
                    onChange={(e) => setClue(e.target.value)}
                    helperText="Enter a single word that will help the guesser"
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={submitClue}
                    fullWidth
                    sx={{ mt: 2 }}
                    disabled={!clue}
                  >
                    Submit Clue
                  </Button>
                </Box>
              )}
              {hasSubmittedClue && (
                <Alert severity="info" sx={{ mt: 4 }}>
                  You've submitted your clue. {game.clues.find(c => c.player === currentPlayer.id)?.is_valid === false ? 
                    "Your clue was marked as invalid (possibly due to a duplicate). You cannot submit a new clue." : 
                    "Waiting for others..."}
                </Alert>
              )}
              {game.clues && game.clues.length > 0 && (
                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    Submitted Clues:
                  </Typography>
                  <List>
                    {game.clues
                      .filter(c => c.is_valid !== false)
                      .map((clue, index) => (
                        <React.Fragment key={clue.id}>
                          <ListItem>
                            <ListItemText 
                              primary={clue.word}
                              secondary={`by ${clue.player_name}`}
                            />
                          </ListItem>
                          {index < game.clues.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                  </List>
                </Box>
              )}
            </>
          )}
          
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Players:
            </Typography>
            <List>
              {players.map((player, index) => (
                <React.Fragment key={player.id}>
                  <ListItem>
                    <ListItemText 
                      primary={`${player.name} (Score: ${player.score})`}
                      secondary={player.id === game.guesser_id ? '(Guesser)' : ''}
                    />
                  </ListItem>
                  {index < players.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default GamePlay; 