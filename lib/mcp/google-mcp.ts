import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/presentations',
  'https://www.googleapis.com/auth/documents',
];

export class GoogleWorkspaceMCP {
  private oauth2Client: any;

  constructor(clientId: string, clientSecret: string, redirectUri: string, refreshToken?: string) {
    this.oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    if (refreshToken) {
      this.oauth2Client.setCredentials({ refresh_token: refreshToken });
    }
  }

  async sendEmail(to: string, subject: string, body: string) {
    const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
    const message = [
      `To: ${to}`,
      `Subject: ${subject}`,
      '',
      body,
    ].join('\n');

    const encodedMessage = Buffer.from(message).toString('base64url');
    
    await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw: encodedMessage },
    });
    
    return { status: 'sent', to, subject };
  }

  async createCalendarEvent(summary: string, description: string, startTime: string, endTime: string, attendees?: string[]) {
    const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
    
    const event = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary,
        description,
        start: { dateTime: startTime, timeZone: 'Asia/Manila' },
        end: { dateTime: endTime, timeZone: 'Asia/Manila' },
        attendees: attendees?.map(email => ({ email })),
      },
    });
    
    return { event: event.data };
  }

  async createSpreadsheet(name: string, sheets: { title: string; data?: any[][] }[] = []) {
    const sheetsAPI = google.sheets({ version: 'v4', auth: this.oauth2Client });
    
    const spreadsheet = await sheetsAPI.spreadsheets.create({
      requestBody: {
        properties: { title: name },
        sheets: sheets.map(s => ({ properties: { title: s.title } })),
      },
    });
    
    return { spreadsheet: spreadsheet.data };
  }

  async createPresentation(title: string) {
    const presentations = google.slides({ version: 'v1', auth: this.oauth2Client });
    
    const presentation = await presentations.presentations.create({
      requestBody: { title },
    });
    
    return { presentation: presentation.data };
  }

  async createDocument(title: string) {
    const docs = google.docs({ version: 'v1', auth: this.oauth2Client });
    
    const document = await docs.documents.create({
      requestBody: { title },
    });
    
    return { document: document.data };
  }

  async createDriveFile(name: string, mimeType: string, content?: string) {
    const drive = google.drive({ version: 'v3', auth: this.oauth2Client });
    
    const file = await drive.files.create({
      requestBody: { name, mimeType },
      media: content ? { body: content } : undefined,
    });
    
    return { file: file.data };
  }
}
