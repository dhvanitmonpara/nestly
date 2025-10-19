import { Room, RoomServiceClient } from 'livekit-server-sdk';
import { env } from '../conf/env';

class VideocallService {
    livekitHost = env.LIVEKIT_URL;
    roomService = new RoomServiceClient(this.livekitHost, env.LIVEKIT_API_KEY, env.LIVEKIT_API_SECRET);

    createRoom = (name: string) => {
        const opts = {
            name,
            emptyTimeout: 10 * 60, // 10 minutes
            maxParticipants: 20,
        };
        this.roomService.createRoom(opts).then((room: Room) => {
            console.log(`Room created: ${room.name}`);
        });
    };

    listRooms = () => {
        try {
            const rooms = this.roomService.listRooms().then((rooms: Room[]) => {
                return rooms;
            });
            return rooms;
        } catch (error) {
            console.error("Error listing rooms:", error);
        }
    };

    listParticipantsByRoom = (room: string) => {
        const participants = this.roomService.listParticipants(room).then((participants) => {
            return participants;
        });
        return participants;
    };

    deleteRoom = (roomName: string) => {
        this.roomService.deleteRoom(roomName).then(() => {
            console.log('room deleted');
        });
    };
}

const videocallService = new VideocallService();
export default videocallService;