import {io} from "socket.io-client";
const url = 'wss://machine.surepass.io/interface';

export default function initializeSocket(signature) {
    console.log(signature, 'signature');
    const socket = io(url, {
        auth: {token: signature}
    });
    return socket;
}