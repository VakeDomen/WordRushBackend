import { SocketHandler } from '../handler.socket';

export function appendAuth (socket) {

    // socket must emit a name of player
    socket.on('LOGIN', async (name) => {
        const success = SocketHandler.login(socket, name);
        if (success) {
            socket.emit('GREET', 'Hello ' + name + '! Join a room or host a game!');
            socket.emit('LOGIN', {success: true, name: name});
        } else {
            socket.emit('LOGIN', {success: false, name: name});
        }
    });

    socket.on('disconnect', async () => {
        console.log('heyy')
        SocketHandler.logoutBySocket(socket);
    });
}