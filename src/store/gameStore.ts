import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

interface GamePlayer {
  id: string;
  username: string;
  eliminated: boolean;
  cells: Array<{
    stage: number;
    isActive: boolean;
    bullets: number;
  }>;
}

interface Player {
  id: string;
  username: string;
  ready: boolean;
  isLeader: boolean;
}

interface Room {
  id: string;
  leader: string;
  maxPlayers: number;
  players: Player[];
  started: boolean;
  gameState?: {
    currentPlayer: number;
    players: GamePlayer[];
  };
}

interface GameState {
  socket: Socket | null;
  connected: boolean;
  currentRoom: Room | null;
  username: string;
  error: string | null;
  
  connect: () => void;
  createRoom: (maxPlayers: number, password: string | null) => void;
  joinRoom: (roomId: string, password: string | null) => void;
  setUsername: (username: string) => void;
  toggleReady: () => void;
  startGame: () => void;
  clearError: () => void;
  performGameAction: (action: string, data: any) => void;
}

// Use environment variable for server URL
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';
const socket = io(SERVER_URL);

export const useGameStore = create<GameState>((set, get) => ({
  socket: null,
  connected: false,
  currentRoom: null,
  username: '',
  error: null,

  connect: () => {
    socket.on('connect', () => {
      set({ connected: true, socket });
    });

    socket.on('disconnect', () => {
      set({ connected: false });
    });

    socket.on('error', ({ message }) => {
      set({ error: message });
    });

    socket.on('roomCreated', ({ room }) => {
      set({ currentRoom: room });
    });

    socket.on('playerJoined', ({ room }) => {
      set({ currentRoom: room });
    });

    socket.on('roomUpdated', ({ room }) => {
      set({ currentRoom: room });
    });

    socket.on('playerLeft', ({ room }) => {
      set({ currentRoom: room });
    });

    socket.on('gameStarted', ({ gameState }) => {
      set(state => ({
        currentRoom: state.currentRoom ? {
          ...state.currentRoom,
          started: true,
          gameState
        } : null
      }));
    });

    socket.on('gameStateUpdated', ({ gameState }) => {
      set(state => ({
        currentRoom: state.currentRoom ? {
          ...state.currentRoom,
          gameState
        } : null
      }));
    });
  },

  createRoom: (maxPlayers, password) => {
    const { username } = get();
    if (!username) {
      set({ error: 'Please set a username first' });
      return;
    }
    socket.emit('createRoom', { maxPlayers, password, username });
  },

  joinRoom: (roomId, password) => {
    const { username } = get();
    if (!username) {
      set({ error: 'Please set a username first' });
      return;
    }
    socket.emit('joinRoom', { roomId, password, username });
  },

  setUsername: (username) => {
    set({ username });
  },

  toggleReady: () => {
    const { currentRoom } = get();
    if (currentRoom) {
      socket.emit('toggleReady', { roomId: currentRoom.id });
    }
  },

  startGame: () => {
    const { currentRoom } = get();
    if (currentRoom) {
      socket.emit('startGame', { roomId: currentRoom.id });
    }
  },

  performGameAction: (action, data) => {
    const { currentRoom } = get();
    if (currentRoom) {
      socket.emit('gameAction', {
        roomId: currentRoom.id,
        action,
        data
      });
    }
  },

  clearError: () => {
    set({ error: null });
  }
}));