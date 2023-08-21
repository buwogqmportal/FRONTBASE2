import type { ConnectionSend } from '$baselib/connection';
import { APINotFoundError, APIResponseError } from '$baselib/connection';

export type APITrade = {
  trades_ID: string;
  trades_title: string;
  trades_usage: string;
};

export class TradesFirmRequest {
  constructor(private session: string, private connectionSend: ConnectionSend) {}

  async setTradesFirm(data: {
    trades_ID: string;
    firm_ID: string;
    project_ID: string;
    external_trades_ID: string;
  }): Promise<string> {
    const response = await this.connectionSend<string>('tradesfirm/set', data);

    if (response.status === 404) {
      throw new APINotFoundError(response?.error.message);
    }

    return response.success.data;
  }

  async deletesTradesFirm(data: { trades_ID: string; firm_ID: string; project_ID: string }): Promise<void> {
    const response = await this.connectionSend<void>('tradesfirm/delete', data);

    if (response.status === 404) {
      throw new APINotFoundError(response?.error.message);
    }

    if (response.status === 400) {
      throw new APIResponseError(response.error.message, response.error.status);
    }
  }
}
