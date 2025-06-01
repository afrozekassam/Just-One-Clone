import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import GameLobby from './pages/GameLobby';
import GamePlay from './pages/GamePlay';
import Home from './pages/Home';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/game/:gameId" element={<GameLobby />} />
          <Route path="/game/:gameId/play" element={<GamePlay />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
