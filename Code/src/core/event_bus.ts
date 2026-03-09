import { EventEmitter } from 'events';
import { ISignalPayload, IOpenTabsPayload } from '../shared/types';

export class AppEventBus extends EventEmitter {
    public emitSignal(payload: ISignalPayload): void {
        this.emit('SignalDetectedEvent', payload);
    }

    public onSignal(listener: (payload: ISignalPayload) => void): void {
        this.on('SignalDetectedEvent', listener);
    }

    public emitOpenTabs(payload: IOpenTabsPayload): void {
        this.emit('OpenBrowserTabsRequest', payload);
    }

    public onOpenTabs(listener: (payload: IOpenTabsPayload) => void): void {
        this.on('OpenBrowserTabsRequest', listener);
    }

    public clearOpenTabsListeners(): void {
        this.removeAllListeners('OpenBrowserTabsRequest');
    }
}
