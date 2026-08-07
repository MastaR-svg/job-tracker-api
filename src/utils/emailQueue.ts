import EventEmitter from "events";
import { logger } from "../config/logger";
import { emailService } from "../services/email.service";

interface WelcomeEmailEvent {
  to: string;
  username: string;
}

interface StatusChangeEmailEvent {
  to: string;
  username: string;
  company: string;
  position: string;
  newStatus: string;
}

class EmailQueue extends EventEmitter {
  constructor() {
    super();
    this.registerListeners();
  }

  private registerListeners(): void {
    this.on("welcome", async (payload: WelcomeEmailEvent) => {
      logger.info(`Processing welcome email for ${payload.to}`);
      await emailService.sendWelcomeEmail(payload.to, payload.username);
    });

    this.on("statusChange", async (payload: StatusChangeEmailEvent) => {
      logger.info(`Processing status change email for ${payload.to}`);
      await emailService.sendStatusChangeEmail(
        payload.to,
        payload.username,
        payload.company,
        payload.position,
        payload.newStatus,
      );
    });

    this.on("error", (err) => {
      logger.error("Error queue error", { error: err.message });
    });
  }

  sendWelcomeEmail(payload: WelcomeEmailEvent): void {
    setImmediate(() => this.emit("welcome", payload));
  }

  sendStatusChangeEmail(payload: StatusChangeEmailEvent): void {
    setImmediate(() => this.emit("statusChange", payload));
  }
}

export const emailQueue = new EmailQueue();
