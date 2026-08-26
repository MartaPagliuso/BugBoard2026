import { transporter, MAIL_FROM } from '../utils/mailer.js';

export class MailService {
  private escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

  /**
   * Servizio che invia l'email all'utente quando la issue viene risolta
   * @param to 
   * @param issueTitle 
   */
  async sendIssueResolvedEmail(to: string, issueTitle: string) {
    await transporter.sendMail({
      from: MAIL_FROM,
      to,
      subject: `Issue risolta: ${issueTitle}`,
      text: `Ciao,\n\nla issue "${issueTitle}" che hai segnalato è stata risolta.\n\nBugBoard`,
      html: `<p>Ciao,</p><p>la issue <strong>${this.escapeHtml(issueTitle)}</strong> che hai segnalato è stata risolta.</p><p>BugBoard</p>`,
    });
  }
}

