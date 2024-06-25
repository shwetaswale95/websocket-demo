import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Observable, from } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private socket$: WebSocketSubject<any> | any;
  public messages: Observable<any> | any;

  constructor() { }

  connect(url: string): WebSocketSubject<any> {
    if (!this.socket$ || this.socket$.closed) {
      this.socket$ = webSocket({
        url: url,
        deserializer: (msg) => this.deserializeMessage(msg.data), // Deserialize the Blob
        serializer: (msg) => JSON.stringify(msg) // Serialize the message to JSON
      });

      this.messages = this.socket$.multiplex(
        () => null,
        () => null,
        (msg: any) => true
      ).pipe(
        mergeMap((msg: any) => from(msg)) // Flatten the promise
      );
    }
    return this.socket$;
  }

  private async deserializeMessage(data: any): Promise<any> {
    if (typeof data === 'string') {
      return JSON.parse(data);
    } else if (data instanceof Blob) {
      return new Promise<any>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            resolve(JSON.parse(reader.result as string));
          } catch (err) {
            reject(err);
          }
        };
        reader.onerror = reject;
        reader.readAsText(data);
      });
    } else {
      throw new Error('Unsupported message type');
    }
  }

  sendMessage(msg: any) {
    this.socket$.next(msg); // Ensure msg is an object and will be serialized as JSON
  }

  close() {
    this.socket$.complete();
  }
}
