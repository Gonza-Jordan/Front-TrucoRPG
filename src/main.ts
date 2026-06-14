import { bootstrapApplication } from '@angular/platform-browser';
import { Buffer } from 'buffer';
import { appConfig } from './app/app.config';
import { App } from './app/app';

if (!(globalThis as any).Buffer) {
  (globalThis as any).Buffer = Buffer;
}

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
