import { Injectable } from "@nestjs/common";
import { Observable, Subject } from "rxjs";

export type LobbyNotification =
    | { type: "lobby.updated"; lobbyId: string }
    | { type: "lobby.game_started"; lobbyId: string };

@Injectable()
export class LobbyNotifier {
    private readonly subject = new Subject<LobbyNotification>();

    notify(event: LobbyNotification): void {
        this.subject.next(event);
    }

    asObservable(): Observable<LobbyNotification> {
        return this.subject.asObservable();
    }

    emitLobbyUpdate(lobbyId: string): void {
        this.notify({ type: "lobby.updated", lobbyId });
    }
}
