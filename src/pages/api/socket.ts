import { Server } from "socket.io";
import { EventName } from "src/shared/socketName";
import { nanoid } from "nanoid";

const SocketHandler = (req, res) => {
    if (res.socket.server.io) {
        console.log("Socket is already running");
    } else {
        console.log("Socket is initializing");
        const io = new Server(res.socket.server);
        res.socket.server.io = io;

        io.on("connection", (socket) => {
            socket.on(EventName.RESET, () => {
                console.log("Reset Event Received");
                socket.broadcast.emit(EventName.RESET_REQUESTED);
            });

            socket.on(EventName.CARD_SELECTED, (data) => {
                console.log("Card Selected", { data });
                socket.broadcast.emit(EventName.CARD_SELECT_REQUESTED, data);
            });

            socket.on(EventName.CARD_REMOVED, (data) => {
                console.log("Card Removed", { data });
                socket.broadcast.emit(EventName.CARD_REMOVED_REQUESTED, data);
            });

            socket.on(EventName.REVEAL, () => {
                console.log("Reveal Hand");
                socket.broadcast.emit(EventName.REVEAL_REQUESTED);
            });
        });
    }

    res.send();
};

export default SocketHandler;
