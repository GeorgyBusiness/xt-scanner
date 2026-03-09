import CDP from 'chrome-remote-interface';

export class XTSniper {
    private cdpClient: CDP.Client;

    constructor(client: CDP.Client) {
        this.cdpClient = client;
    }

    private async delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private async getElementCenter(xpath: string): Promise<{ x: number, y: number } | null> {
        const expression = `
            (() => {
                const result = document.evaluate("${xpath}", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
                const el = result.singleNodeValue;
                if (!el) return null;
                const rect = el.getBoundingClientRect();
                return JSON.stringify({
                    x: rect.left + rect.width / 2,
                    y: rect.top + rect.height / 2
                });
            })();
        `;

        try {
            const result = await this.cdpClient.Runtime.evaluate({ expression, returnByValue: true });
            if (result.result && result.result.value) {
                return JSON.parse(result.result.value);
            }
        } catch (err) {
            console.error('[XTSniper] Error getting element center:', err);
        }
        return null;
    }

    // Умный поиск именно Торговой кнопки (игнорируем шапку сайта)
    private async getTradeButton(): Promise<{ x: number, y: number, text: string } | null> {
        const expression = `
            (() => {
                const buttons = Array.from(document.querySelectorAll('button')).filter(b => b.innerText.includes('Buy'));
                const tradeButtons = buttons.filter(b => !b.innerText.includes('Crypto'));
                
                const el = tradeButtons[tradeButtons.length - 1]; 
                if (!el) return null;
                
                const rect = el.getBoundingClientRect();
                return JSON.stringify({
                    x: rect.left + rect.width / 2,
                    y: rect.top + rect.height / 2,
                    text: el.innerText.trim()
                });
            })();
        `;

        try {
            const result = await this.cdpClient.Runtime.evaluate({ expression, returnByValue: true });
            if (result.result && result.result.value) {
                return JSON.parse(result.result.value);
            }
        } catch (err) {
            console.error('[XTSniper] Error finding Trade button:', err);
        }
        return null;
    }

    private async clickAt(x: number, y: number, clickCount: number = 1) {
        for (let i = 1; i <= clickCount; i++) {
            await this.cdpClient.Input.dispatchMouseEvent({
                type: 'mousePressed', x, y, button: 'left', clickCount: i
            });
            await this.delay(30);
            await this.cdpClient.Input.dispatchMouseEvent({
                type: 'mouseReleased', x, y, button: 'left', clickCount: i
            });
            await this.delay(30);
        }
    }

    private async typeText(text: string) {
        await this.cdpClient.Input.dispatchKeyEvent({ type: 'rawKeyDown', key: 'Backspace', windowsVirtualKeyCode: 8 });
        await this.cdpClient.Input.dispatchKeyEvent({ type: 'keyUp', key: 'Backspace', windowsVirtualKeyCode: 8 });
        await this.delay(30);

        for (const char of text) {
            await this.cdpClient.Input.insertText({ text: char });
            await this.delay(10); // Ускорили печать
        }
    }

    public async executeBuy(price: string, amountUsdt: string) {
        console.log(`[XTSniper] Executing BUY ${amountUsdt} USDT at price ${price}`);

        // 1. Ввод Цены
        const priceXPath = "//div[text()='Price']/following-sibling::input | //div[contains(text(), 'Price')]/following-sibling::div//input[1]";
        const priceCoords = await this.getElementCenter(priceXPath);
        if (priceCoords) {
            await this.clickAt(priceCoords.x, priceCoords.y, 3);
            await this.delay(30);
            await this.typeText(price);
        }

        // 2. Ввод Суммы USDT
        const amountXPath = "//div[text()='Total']/following-sibling::input | //div[contains(text(), 'Total')]/following-sibling::div//input[1]";
        const amountCoords = await this.getElementCenter(amountXPath);
        if (amountCoords) {
            await this.clickAt(amountCoords.x, amountCoords.y, 3);
            await this.delay(30);
            await this.typeText(amountUsdt);
        }

        // Пауза убрана! Идем сразу на кнопку.

        // 3. Клик по кнопке Buy
        const buttonData = await this.getTradeButton();

        if (buttonData) {
            console.log(`[XTSniper] Found correct button: "${buttonData.text}". Clicking immediately!`);

            await this.cdpClient.Input.dispatchMouseEvent({
                type: 'mouseMoved',
                x: buttonData.x,
                y: buttonData.y
            });
            await this.delay(30); // Микро-задержка движения мыши

            // Реальный клик (Стреляем!)
            await this.clickAt(buttonData.x, buttonData.y, 1);

        } else {
            console.warn(`[XTSniper] Failed to find Buy button element.`);
        }
    }
}