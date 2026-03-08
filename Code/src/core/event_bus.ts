import { EventEmitter } from 'events';
import { ISignalPayload } from '../shared/types';

export class AppEventBus extends EventEmitter {
    public emitSignal(payload: ISignalPayload): void {
        this.emit('SignalDetectedEvent', payload);
    }

    public onSignal(listener: (payload: ISignalPayload) => void): void {
        this.on('SignalDetectedEvent', listener);
    }
}
