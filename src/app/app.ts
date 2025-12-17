import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { API } from './config';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('calling-appUI');
  message: string | null = null;

  async makeCall(caller: string, extension: string) {
    this.message = 'Call is attempted';
    const extNum = Number(extension) || 0;
    const payload = { caller: caller || '', extention: extNum };
    try {
      const res = await fetch(`${API.baseUrl}${API.events}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        this.message = 'Call is attempted';
      } else {
        const text = await res.text().catch(() => '');
        this.message = `Call failed${text ? ': ' + text : ''}`;
      }
    } catch (e) {
      this.message = 'Call failed';
    }
  }
}
