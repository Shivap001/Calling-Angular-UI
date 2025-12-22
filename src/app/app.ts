import * as signalR from '@microsoft/signalr';
import { Component, signal, OnInit, NgZone } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { API } from './config';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {

  protected readonly title = signal('calling-appUI');
  message: string | null = null;

  private hub!: signalR.HubConnection;

  constructor(private ngZone: NgZone) {}

  // 🔹 Runs once when app loads
  ngOnInit(): void {
    this.startSignalR();
  }

  // 🔹 Start SignalR connection (ONLY for ACKs)
  private startSignalR() {
    this.hub = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7187/eventsHub', {   
        withCredentials: false   // IMPORTANT
    })
      .withAutomaticReconnect()
      .build();

    this.hub.start()
      .then(() => {
        console.log('App1 SignalR connected');
        // Register App1 connection on server
        this.hub.invoke('RegisterApp1');
      })
      .catch(err => console.error('SignalR error:', err));

    //  Listen for ACK from server
    this.hub.on('ReceiveAcknowledgement', ack => {
      console.log('ACK received:', ack);
      this.ngZone.run(() => {
        this.message = `ACK received for request ${ack.requestId} (${ack.status})`;
      });
    });
  }

  // Your EXISTING HTTP API call (unchanged)
  async makeCall(caller: string, extension: string) {
    this.message = 'Call is attempted';

    const extNum = Number(extension) || 0;
    const payload = { caller: caller || '', extension: extNum };

    try {
      const res = await fetch(`${API.baseUrl}${API.events}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const result = await res.json();
        this.message = `Call sent (requestId: ${result.requestId})`;
      } else {
        const text = await res.text().catch(() => '');
        this.message = `Call failed${text ? ': ' + text : ''}`;
      }
    } catch (e) {
      this.message = 'Call failed';
    }
  }
}
