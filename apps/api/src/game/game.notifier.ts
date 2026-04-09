import { Injectable } from "@nestjs/common";
import { type Observable, Subject } from "rxjs";

export type GameNotification =
    | { type: "game.updated"; lobbyId: string }
    | { type: "game.finished"; lobbyId: string };

@Injectable()
export class GameNotifier {
    private readonly subject = new Subject<GameNotification>();

    notify(event: GameNotification): void {
        this.subject.next(event);
    }

    asObservable(): Observable<GameNotification> {
        return this.subject.asObservable();
    }

    emitGameUpdate(lobbyId: string): void {
        this.notify({ type: "game.updated", lobbyId });
    }
}
