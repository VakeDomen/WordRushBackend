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

    socket.on('LOBBY_HOST_GAME', async () => {
        const game = new Game()
        game.id = uuidv4();
        game.host = SocketHandler.connectionPlayerMap.get(socket);
        game.players = [game.host];
        game.running = false;
        socket.join(game.id);
        SocketHandler.games.push(game);
        SocketHandler.broadcast('LOBBY_GAMES', SocketHandler.games);
    });

    socket.on('LOBBY_JOIN_GAME', (id) => {
        console.log('1');
        const player = SocketHandler.connectionPlayerMap.get(socket);
        for (const game of SocketHandler.games) {
            console.log('1');
            if (game.id === id && player !== game.host) {
                game.players.push(player);
                console.log("heyheyhey")
                socket.join(game.id);
                SocketHandler.io.to(game.id).emit('LOBBY_JOIN_GAME', game);
            }
        }
    })
}