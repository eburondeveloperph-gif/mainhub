/* eslint-disable @typescript-eslint/no-explicit-any */
import { 
  ImageGenerateArgs, ImageEditArgs, 
  VpsDeployComposeArgs, VpsRestartServiceArgs, VpsGetStatusArgs,
  VpsRollbackReleaseArgs, VpsGetLogsArgs, VpsSystemStatsArgs,
  VpsReadFileArgs, VpsListDirectoryArgs, VpsRunCommandArgs,
  VpsExecuteCommandArgs,
  OllamaPullArgs, OllamaListArgs, OllamaPsArgs, OllamaRmArgs
} from "./tools.schemas";
import { imageGenerate, imageEdit } from "./adapters";
import { 
  vpsDeployCompose, vpsRestartService, vpsGetStatus,
  vpsRollbackRelease, vpsGetLogs, vpsSystemStats,
  vpsReadFile, vpsListDirectory, vpsRunCommand, vpsExecuteCommand,
  ollamaPull, ollamaList, ollamaPs, ollamaRm
} from "./vps/runnerClient";

export const toolRegistry: any = {
  image_generate: {
    validate: (args: any) => ImageGenerateArgs.parse(args),
    execute: (args: any) => imageGenerate(args)
  },
  image_edit: {
    validate: (args: any) => ImageEditArgs.parse(args),
    execute: (args: any) => imageEdit(args)
  },
  vps_deploy_compose: {
    validate: (args: any) => VpsDeployComposeArgs.parse(args),
    execute: (args: any) => vpsDeployCompose(args)
  },
  vps_rollback_release: {
    validate: (args: any) => VpsRollbackReleaseArgs.parse(args),
    execute: (args: any) => vpsRollbackRelease(args)
  },
  vps_restart_service: {
    validate: (args: any) => VpsRestartServiceArgs.parse(args),
    execute: (args: any) => vpsRestartService(args)
  },
  vps_get_status: {
    validate: (args: any) => VpsGetStatusArgs.parse(args),
    execute: (args: any) => vpsGetStatus(args)
  },
  vps_get_logs: {
    validate: (args: any) => VpsGetLogsArgs.parse(args),
    execute: (args: any) => vpsGetLogs(args)
  },
  vps_system_stats: {
    validate: (args: any) => VpsSystemStatsArgs.parse(args),
    execute: (args: any) => vpsSystemStats(args)
  },
  vps_read_file: {
    validate: (args: any) => VpsReadFileArgs.parse(args),
    execute: (args: any) => vpsReadFile(args)
  },
  vps_list_directory: {
    validate: (args: any) => VpsListDirectoryArgs.parse(args),
    execute: (args: any) => vpsListDirectory(args)
  },
  vps_run_command: {
    validate: (args: any) => VpsRunCommandArgs.parse(args),
    execute: (args: any) => vpsRunCommand(args)
  },
  vps_execute_command: {
    validate: (args: any) => VpsExecuteCommandArgs.parse(args),
    execute: (args: any) => vpsExecuteCommand(args)
  },
  ollama_pull: {
    validate: (args: any) => OllamaPullArgs.parse(args),
    execute: (args: any) => ollamaPull(args)
  },
  ollama_list: {
    validate: (args: any) => OllamaListArgs.parse(args),
    execute: (args: any) => ollamaList(args)
  },
  ollama_ps: {
    validate: (args: any) => OllamaPsArgs.parse(args),
    execute: (args: any) => ollamaPs(args)
  },
  ollama_rm: {
    validate: (args: any) => OllamaRmArgs.parse(args),
    execute: (args: any) => ollamaRm(args)
  }
};

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  try {
    const { google } = require('googleapis');
    const oauth2Client = new (google.auth as any).OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5040/oauth/callback'
    );
    
    if (process.env.GOOGLE_REFRESH_TOKEN) {
      oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
    }
    
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    
    toolRegistry.gmail_list = {
      validate: (args: any) => ({ query: args.query || '', maxResults: args.maxResults || 10 }),
      execute: async (args: any) => {
        try {
          const res = await gmail.users.messages.list({
            userId: 'me',
            q: args.query,
            maxResults: args.maxResults
          });
          return { messages: res.data.messages || [] };
        } catch (e: any) {
          return { error: e.message };
        }
      }
    };
    
    toolRegistry.gmail_send = {
      validate: (args: any) => ({ to: args.to, subject: args.subject, body: args.body }),
      execute: async (args: any) => {
        try {
          const message = [
            `To: ${args.to}`,
            `Subject: ${args.subject}`,
            '',
            args.body
          ].join('\n');
          const encoded = Buffer.from(message).toString('base64url');
          await gmail.users.messages.send({
            userId: 'me',
            requestBody: { raw: encoded }
          });
          return { status: 'sent', to: args.to, subject: args.subject };
        } catch (e: any) {
          return { error: e.message };
        }
      }
    };
    
    toolRegistry.calendar_list = {
      validate: (args: any) => ({ timeMin: args.timeMin, timeMax: args.timeMax, maxResults: args.maxResults || 10 }),
      execute: async (args: any) => {
        try {
          const res = await calendar.events.list({
            calendarId: 'primary',
            timeMin: args.timeMin || new Date().toISOString(),
            timeMax: args.timeMax,
            maxResults: args.maxResults,
            singleEvents: true,
            orderBy: 'startTime'
          });
          return { events: res.data.items || [] };
        } catch (e: any) {
          return { error: e.message };
        }
      }
    };
    
    toolRegistry.calendar_create = {
      validate: (args: any) => ({ summary: args.summary, description: args.description, startTime: args.startTime, endTime: args.endTime }),
      execute: async (args: any) => {
        try {
          const res = await calendar.events.insert({
            calendarId: 'primary',
            requestBody: {
              summary: args.summary,
              description: args.description,
              start: { dateTime: args.startTime, timeZone: 'Asia/Manila' },
              end: { dateTime: args.endTime, timeZone: 'Asia/Manila' }
            }
          });
          return { event: res.data };
        } catch (e: any) {
          return { error: e.message };
        }
      }
    };
    
    toolRegistry.drive_list = {
      validate: (args: any) => ({ query: args.query || '', pageSize: args.pageSize || 10 }),
      execute: async (args: any) => {
        try {
          const res = await drive.files.list({
            q: args.query,
            pageSize: args.pageSize,
            fields: 'files(id, name, mimeType, webViewLink)'
          });
          return { files: res.data.files || [] };
        } catch (e: any) {
          return { error: e.message };
        }
      }
    };
    
    console.log('[tool-broker] Google Workspace tools registered');
  } catch (e) {
    console.warn('[tool-broker] Google Workspace not initialized:', e);
  }
}

export type ToolName = keyof typeof toolRegistry;
