import { io } from 'socket.io-client';
import API_URL from '../config';

const SOCKET_URL = API_URL;

class SocketService {
    constructor() {
        this.socket = null;
    }

    connect(tournamentId) {
        if (this.socket) return;

        this.socket = io(SOCKET_URL);

        this.socket.on('connect', () => {
            console.log('Connected to socket server');
            this.socket.emit('join_tournament', { tournament_id: tournamentId });
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from socket server');
        });
    }

    on(event, callback) {
        if (!this.socket) return;
        this.socket.on(event, callback);
    }

    off(event, callback) {
        if (!this.socket) return;
        this.socket.off(event, callback);
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }
}

export default new SocketService();
