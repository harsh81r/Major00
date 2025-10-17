import { io } from 'socket.io-client';

const initSocket = async () => {
    const options = {
        'force new connection': true,
        reconnectionAttempts: 'Infinity',
        timeout: 10000,
        transports: ['websocket'],
    };

    return io(process.env.REACT_APP_SERVER_URL || 'http://localhost:5001', options);
};

export default initSocket;