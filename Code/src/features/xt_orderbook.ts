import CDP from 'chrome-remote-interface';
import { IXTSnapshotResponse, IXTDeltaFrame } from '../shared/types';

export interface IExecutionResult {
    averagePrice: number | null;
    maxPriceHit: number | null;
    isVolumeSufficient: boolean;
}

export class XTOrderbookManager {
    private bids: Map<string, number> = new Map();
    private asks: Map<string, number> = new Map();
    private lastUpdateId: number = 0;
    private deltaBuffer: IXTDeltaFrame[] = [];
    private isSnapshotLoaded: boolean = false;
    private cdpClient: CDP.Client;

    constructor(client: CDP.Client) {
        this.cdpClient = client;
        this.setupListeners();
    }

    private setupListeners() {
        this.cdpClient.Network.responseReceived(async (params) => {
            const { response, requestId } = params;
            if (response.url.includes('depth')) {
                try {
                    const body = await this.cdpClient.Network.getResponseBody({ requestId });
                    let data;
                    if (body.base64Encoded) {
                        data = JSON.parse(Buffer.from(body.body, 'base64').toString('utf-8'));
                    } else {
                        data = JSON.parse(body.body);
                    }

                    const snapshot: IXTSnapshotResponse = data.result || data;
                    if (snapshot && snapshot.lastUpdateId) {
                        this.processSnapshot(snapshot);
                    }
                } catch (e) {
                    // Ignore parse errors or body not found 
                }
            }
        });

        this.cdpClient.Network.webSocketFrameReceived((params) => {
            const { response } = params;
            try {
                const payload = JSON.parse(response.payloadData);
                if (payload.topic === 'depth_update') {
                    const delta: IXTDeltaFrame = payload.data;
                    this.processDelta(delta);
                }
            } catch (e) {
                // Ignore parse errors
            }
        });
    }

    private processSnapshot(snapshot: IXTSnapshotResponse) {
        this.bids.clear();
        this.asks.clear();
        this.lastUpdateId = snapshot.lastUpdateId;

        if (snapshot.bids) {
            snapshot.bids.forEach(([price, volume]) => {
                this.bids.set(price, parseFloat(volume));
            });
        }
        if (snapshot.asks) {
            snapshot.asks.forEach(([price, volume]) => {
                this.asks.set(price, parseFloat(volume));
            });
        }

        this.isSnapshotLoaded = true;
        this.applyBufferedDeltas();
    }

    private applyBufferedDeltas() {
        while (this.deltaBuffer.length > 0) {
            const delta = this.deltaBuffer.shift();
            if (delta) {
                this.applyDeltaToMap(delta);
            }
        }
    }

    private processDelta(delta: IXTDeltaFrame) {
        if (!this.isSnapshotLoaded) {
            this.deltaBuffer.push(delta);
            return;
        }

        if (delta.i < this.lastUpdateId) {
            return;
        }

        this.applyDeltaToMap(delta);
        this.lastUpdateId = delta.i;
    }

    private applyDeltaToMap(delta: IXTDeltaFrame) {
        if (delta.b) {
            delta.b.forEach(([price, volume]) => {
                const volNum = parseFloat(volume);
                if (volNum <= 0) {
                    this.bids.delete(price);
                } else {
                    this.bids.set(price, volNum);
                }
            });
        }

        if (delta.a) {
            delta.a.forEach(([price, volume]) => {
                const volNum = parseFloat(volume);
                if (volNum <= 0) {
                    this.asks.delete(price);
                } else {
                    this.asks.set(price, volNum);
                }
            });
        }
    }

    public calculateExecution(targetUsdt: number): IExecutionResult {
        if (!this.isSnapshotLoaded || this.asks.size === 0) {
            return { averagePrice: null, maxPriceHit: null, isVolumeSufficient: false };
        }

        const sortedAsks = Array.from(this.asks.entries()).sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]));

        let cumulativeUsdt = 0;
        let cumulativeVolume = 0;
        let maxPriceHit: number | null = null;
        let isVolumeSufficient = false;

        for (const [priceStr, volume] of sortedAsks) {
            const price = parseFloat(priceStr);
            const levelUsdt = price * volume;

            if (cumulativeUsdt + levelUsdt >= targetUsdt) {
                const remainingUsdt = targetUsdt - cumulativeUsdt;
                const remainingVolume = remainingUsdt / price;
                cumulativeUsdt += remainingUsdt;
                cumulativeVolume += remainingVolume;
                maxPriceHit = price;
                isVolumeSufficient = true;
                break;
            } else {
                cumulativeUsdt += levelUsdt;
                cumulativeVolume += volume;
                maxPriceHit = price;
            }
        }

        if (!isVolumeSufficient) {
            return { averagePrice: null, maxPriceHit: null, isVolumeSufficient: false };
        }

        const averagePrice = cumulativeUsdt / cumulativeVolume;
        return { averagePrice, maxPriceHit, isVolumeSufficient };
    }

    public calculateSweep(maxPriceLimit: number, targetUsdt: number): { safePrice: number, safeAmountUsdt: number } {
        if (!this.isSnapshotLoaded || this.asks.size === 0) {
            return { safePrice: 0, safeAmountUsdt: 0 };
        }

        const sortedAsks = Array.from(this.asks.entries()).sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]));

        let cumulativeUsdt = 0;
        let safePrice = 0;

        for (const [priceStr, volume] of sortedAsks) {
            const price = parseFloat(priceStr);
            if (price > maxPriceLimit) {
                break;
            }

            const levelUsdt = price * volume;

            if (cumulativeUsdt + levelUsdt >= targetUsdt) {
                const remainingUsdt = targetUsdt - cumulativeUsdt;
                cumulativeUsdt += remainingUsdt;
                safePrice = price;
                break;
            } else {
                cumulativeUsdt += levelUsdt;
                safePrice = price;
            }
        }

        return { safePrice, safeAmountUsdt: cumulativeUsdt };
    }

    public getTopBids(n: number): [string, number][] {
        return Array.from(this.bids.entries())
            .sort((a, b) => parseFloat(b[0]) - parseFloat(a[0]))
            .slice(0, n);
    }

    public getTopAsks(n: number): [string, number][] {
        return Array.from(this.asks.entries())
            .sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]))
            .slice(0, n);
    }

    public getSnapshotStatus(): boolean {
        return this.isSnapshotLoaded;
    }
}
