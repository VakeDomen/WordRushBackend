
const fs = require("fs");
const path = require('path');
import { appendAuth } from './routes/auth.socket';
import { rooms } from './routes/rooms.socket';
import { Game } from '../models/game';

export class SocketHandler {

    static io;

    // connected sockets of players
    // Map<key: string, value: Socket>
    static playerConnectionMap = new Map();
    // Map<key: Socket, value: string>
    static connectionPlayerMap = new Map();

    static games: Game[] = [];

    static init(io) {
        this.io = io;
        io.on('connection', (socket) => {
            console.log('New socket connection...');
            // append functionality
            appendAuth(socket);
            rooms(socket);
        });
    }

    static login (socket, player: string): boolean {
        if (this.playerConnectionMap.get(player)) {
            return false;
        }
        this.playerConnectionMap.set(player, socket);
        this.connectionPlayerMap.set(socket, player);
        return true;
    }

    static logoutBySocket(socket): void {
        const player = this.connectionPlayerMap.get(socket);
        this.playerConnectionMap.delete(player);
        this.connectionPlayerMap.delete(socket);
        this.removePlayerFromGames(player);
    }

    static removePlayerFromGames(player: string): void {
        for (const game of this.games) {
            if (game.players.includes(player)) {
                game.players.splice(game.players.indexOf(player), 1);
            }
            if (game.host === player) {
                this.closeGame(game);
            }
        }
    }

    static closeGame(game: Game): void {
        for (const player of game.players) {
            this.playerConnectionMap.get(player).emit('GAME_CLOSED', game.id);
        }
        this.games.splice(this.games.indexOf(game), 1);
    }

    static emitToPlayer(recipient: string, key: string, value: any): void {
        const socket = this.playerConnectionMap.get(recipient);
        if (socket) {
            socket.emit(key, value);
        }
    }

    static broadcast(key: string, value: any): void {
        this.io.emit(key, value);
    }
}  