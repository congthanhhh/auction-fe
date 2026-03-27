import io from 'socket.io-client';
import { useAuthStore } from '@/stores/authStore';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:9092';

class SocketService {
    private socket: any | null = null;

    connect() {
        if (!this.socket || this.socket.disconnected) {
            const accessToken = useAuthStore.getState().accessToken;

            if (!accessToken) {
                console.warn('Socket.IO: no access token available, skipping connection');
                return this.socket;
            }

            this.socket = io(SOCKET_URL, {
                transports: ['websocket'],
                query: {
                    token: accessToken,
                },
            });

            this.socket.on('connect', () => {
                console.log('Socket.IO connected:', this.socket?.id);
            });

            this.socket.on('disconnect', (reason: any) => {
                console.log('Socket.IO disconnected:', reason);
            });

            this.socket.on('connect_error', (error: any) => {
                console.error('Socket.IO connection error:', error);
            });
        }
        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    joinRoom(roomName: string) {
        if (this.socket) {
            this.socket.emit('join_auction_session', roomName);
            console.log(`Joined room: ${roomName}`);
        }
    }

    leaveRoom(roomName: string) {
        if (this.socket) {
            this.socket.emit('leave_auction_session', roomName);
            console.log(`Left room: ${roomName}`);
        }
    }

    on<T>(eventName: string, callback: (data: T) => void) {
        if (this.socket) {
            this.socket.on(eventName, callback);
        }
    }

    off(eventName: string) {
        if (this.socket) {
            this.socket.off(eventName);
        }
    }
}

export const socketService = new SocketService();
