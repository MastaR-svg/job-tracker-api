import nodemailer, { Transporter } from "nodemailer";
import { env } from "../config/env";
import { logger } from "../config/logger";
import {
  statusChangeEmailTemplate,
  welcomeEmailTemplate,
} from "../utils/emailTemplates";

class EmailService {
  private transporter: Transporter | null = null;
  private initialized = false;
  private async getTransporter(): Promise<Transporter> {
    if (this.transporter && this.initialized) {
      return this.transporter;
    }

    if (env.nodeEnv === "test") {
      this.transporter = nodemailer.createTransport({ jsonTransport: true });
      this.initialized = true;
      return this.transporter;
    }

    if (!env.emailUser || !env.emailPass) {
      logger.info("No SMTP credentials — creating Ethereal test account");
      const testAccount = await nodemailer.createTestAccount();

      this.transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      logger.info(`Ethereal account created: ${testAccount.user}`);
      logger.info("Emails viewable at: https://ethereal.email");
      this.initialized = true;
      return this.transporter;
    }

    this.transporter = nodemailer.createTransport({
      host: env.emailHost,
      port: env.emailPort,
      secure: env.emailPort === 465,
      auth: {
        user: env.emailUser,
        pass: env.emailPass,
      },
    });

    this.initialized = true;
    return this.transporter;
  }

  private async send(
    to: string,
    subject: string,
    html: string,
    text: string,
  ): Promise<void> {
    try {
      const transporter = await this.getTransporter();

      const info = await transporter.sendMail({
        from: env.emailFrom,
        to,
        subject,
        html,
        text,
      });

      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        logger.info(`📧 Email preview URL: ${previewUrl}`);
      }

      logger.info(`Email sent to ${to}: "${subject}"`);
    } catch (error) {
      logger.error("Failed to send email", {
        to,
        subject,
        error: (error as Error).message,
      });
    }
  }

  async sendWelcomeEmail(to: string, username: string): Promise<void> {
    const { subject, html, text } = welcomeEmailTemplate(username);
    await this.send(to, subject, html, text);
  }

  async sendStatusChangeEmail(
    to: string,
    username: string,
    company: string,
    position: string,
    newStatus: string,
  ): Promise<void> {
    const { subject, html, text } = statusChangeEmailTemplate(
      username,
      company,
      position,
      newStatus,
    );
    await this.send(to, subject, html, text);
  }
}

export const emailService = new EmailService();
