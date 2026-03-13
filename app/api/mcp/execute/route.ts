import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(request: NextRequest) {
  try {
    const { name, args } = await request.json();

    // Get Google credentials from environment
    const clientId = process.env.GOOGLE_CLIENT_ID || '';
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN || '';

    if (!clientId || !clientSecret) {
      return NextResponse.json({ error: 'Google credentials not configured' }, { status: 400 });
    }

    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, 'https://localhost:3000');
    oauth2Client.setCredentials({ refresh_token: refreshToken });

    let result;

    switch (name) {
      case 'gmail_send': {
        const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
        const message = [
          `To: ${args.to}`,
          `Subject: ${args.subject}`,
          '',
          args.body,
        ].join('\n');
        const encoded = Buffer.from(message).toString('base64url');
        await gmail.users.messages.send({ userId: 'me', requestBody: { raw: encoded } });
        result = { status: 'sent', to: args.to };
        break;
      }

      case 'calendar_create': {
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
        const event = await calendar.events.insert({
          calendarId: 'primary',
          requestBody: {
            summary: args.summary,
            description: args.description,
            start: { dateTime: args.startTime, timeZone: 'Asia/Manila' },
            end: { dateTime: args.endTime, timeZone: 'Asia/Manila' },
          },
        });
        result = { eventId: event.data.id, status: 'created' };
        break;
      }

      case 'sheets_create': {
        const sheets = google.sheets({ version: 'v4', auth: oauth2Client });
        const spreadsheet = await sheets.spreadsheets.create({
          requestBody: { properties: { title: args.name } },
        });
        result = { spreadsheetId: spreadsheet.data.spreadsheetId, status: 'created' };
        break;
      }

      case 'slides_create': {
        const slides = google.slides({ version: 'v1', auth: oauth2Client });
        const presentation = await slides.presentations.create({
          requestBody: { title: args.name },
        });
        result = { presentationId: presentation.data.presentationId, status: 'created' };
        break;
      }

      case 'docs_create': {
        const docs = google.docs({ version: 'v1', auth: oauth2Client });
        const document = await docs.documents.create({
          requestBody: { title: args.name },
        });
        result = { documentId: document.data.documentId, status: 'created' };
        break;
      }

      case 'drive_create': {
        const drive = google.drive({ version: 'v3', auth: oauth2Client });
        const file = await drive.files.create({
          requestBody: { name: args.name, mimeType: args.mimeType },
        });
        result = { fileId: file.data.id, status: 'created' };
        break;
      }

      default:
        return NextResponse.json({ error: 'Unknown tool' }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
