import { SocketHandler } from '../handler.socket';
import { Game } from '../../models/game';
import * as uuidv4 from 'uuid/v4';


export function rooms(socket) {
    
    socket.on('LOBBY_GAMES', async (futureFilter: any) => {
        socket.emit('LOBBY_GAMES', SocketHandler.games);
    });

    socket.on('LOBBY_GAME', (id) => {
        for (const game of SocketHandler.games) {
            if (game.id === id) {
                socket.emit('LOBBY_GAME', game);
                break;
            }
        }
    });

    socket.on('LOBBY_HOST_GAME', async (mode) => {
        const game = new Game()
        game.id = uuidv4();
        game.host = SocketHandler.connectionPlayerMap.get(socket);
        game.players = [game.host];
        game.running = false;
        game.mode = mode;
        socket.join(game.id);
        SocketHandler.games.push(game);
        SocketHandler.broadcast('LOBBY_GAMES', SocketHandler.games);
    });

    socket.on('LOBBY_JOIN_GAME', (id) => {
        const player = SocketHandler.connectionPlayerMap.get(socket);
        for (const game of SocketHandler.games) {
            if (game.id === id && player !== game.host) {
                game.players.push(player);
                socket.join(game.id);
                SocketHandler.io.to(game.id).emit('LOBBY_JOIN_GAME', game);
            }
        }
    });

    socket.on('LOBBY_LEAVE_GAME', (id) => {
        const player = SocketHandler.connectionPlayerMap.get(socket);
        SocketHandler.removePlayerFromGames(player);
        const game = SocketHandler.getGameById(id);
        console.log(game);
        SocketHandler.io.to(game.id).emit('LOBBY_GAME', game);
        socket.leave(game.id);
    });

    socket.on('LOBBY_START_GAME', (id) => {
        const player = SocketHandler.connectionPlayerMap.get(socket);
        const game = SocketHandler.getGameById(id);
        if (player === game.host) {
            game.running = true;
            SocketHandler.io.to(game.id).emit("LOBBY_START_GAME", game);
        }
    });
}