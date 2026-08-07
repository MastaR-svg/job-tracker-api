import { logger } from "../config/logger";

export interface INotificationStategy {
  send(recipient: string, message: string): Promise<void>;
}

export class ConsoleNotification implements INotificationStategy {
  async send(recipient: string, message: string): Promise<void> {
    logger.info(`📧 To: ${recipient} | Message: ${message}`);
  }
}

export class NotificationService {
  constructor(private strategy: INotificationStategy) {}
  async notifyStatusChange(
    email: string,
    company: string,
    status: string,
  ): Promise<void> {
    const message = `Your application status for ${company} changed to: ${status}`;
    await this.strategy.send(email, message);
  }
}
