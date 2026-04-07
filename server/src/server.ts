import http, { IncomingMessage, ServerResponse } from 'node:http';
import 'dotenv/config';
import { fileURLToPath } from 'url';
import path from 'path';
import { setupUsersTable } from './database/users.db.js';
import { serveHTML, serveStaticFile } from './middleware/serve-static.js';
import { parseRequestBody } from './middleware/bodyParser.js';
import { signupController } from './controllers/signup.controller.js';
import { signinController } from './controllers/signin.controller.js';
import { setupResetTokensTable } from './database/reset-tokens.db.js';
import { resetPasswordController } from './controllers/reset-password.controller.js';
import { updatePasswordController } from './controllers/update-password.controller.js';
import { verifyResetTokenController } from './controllers/verify-reset-token.controller.js';
import { locationController } from './controllers/location.controller.js';
import { triggerTokenCleanup } from './jobs/token-cleanup.jobs.js';
import { getSessionController } from './controllers/session.controller.js';
import { profileController } from './controllers/profile.controller.js';
import { deleteAccountController } from './controllers/delete-account.contoller.js';
import { signOutController } from './controllers/signout-controller.js';
import { googleAuthController } from './controllers/google-auth.controller.js';
import { googleCallbackController } from './controllers/google-callback.controller.js';
import { otpVerificationController } from './controllers/verify-otp.controller.js';
import { resendOTPController } from './controllers/resend-otp.contoller.js';
import { triggerUnverifiedUsersCleanup } from './jobs/unverified-users-cleanup.jobs.js';

const PORT = process.env.PORT || 8000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const __clientdirname = path.join(__dirname, '..', '..', 'client');
const indexPath = path.join(__clientdirname, 'index.html');

const server = http.createServer(
  (req: IncomingMessage, res: ServerResponse) => {
    try {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, OPTIONS ',
      );
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.setHeader('Access-Control-Allow-Credentials', 'true');

      if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        res.end();
        return;
      }

      if (req.url?.startsWith('/api')) {
        if (req.method === 'POST' || req.method === 'PATCH') {
          if (req.url === '/api/signout') {
            signOutController(req, res);
            return;
          }
          parseRequestBody(req, res, () => {
            if (req.url === '/api/signup') {
              signupController(req, res);
            }
            if (req.url === '/api/verify-otp') {
              otpVerificationController(req, res);
            }
            if (req.url === '/api/resend-otp') {
              resendOTPController(req, res);
            }
            if (req.url === '/api/signin') {
              signinController(req, res);
            }
            if (req.url === '/api/reset') {
              resetPasswordController(req, res);
            }
            if (req.url === '/api/verify-reset-token') {
              verifyResetTokenController(req, res);
            }
            if (req.url === '/api/update') {
              updatePasswordController(req, res);
            }
            if (req.url === '/api/profile') {
              profileController(req, res);
            }
            if (req.url === '/api/delete') {
              deleteAccountController(req, res);
            }
          });
        } else if (req.method === 'GET') {
          if (req.url?.startsWith('/api/auth/google/callback')) {
            googleCallbackController(req, res);
          } else if (req.url?.startsWith('/api/auth/google')) {
            googleAuthController(req, res);
          }
          if (req.url === '/api/location') {
            locationController(req, res);
          }
          if (req.url === '/api/auth/status') {
            getSessionController(req, res);
          }
        }
      } else {
        const extension = path.extname(req.url || '');

        if (extension) {
          serveStaticFile(req, res, __clientdirname, extension, () => {
            serveHTML(req, res, indexPath);
          });
          return;
        }

        serveHTML(req, res, indexPath);
      }
    } catch (err) {
      console.error('INTERNAL SERVER ERROR:', err);
      if (!res.writableEnded) {
        res.statusCode = 500;
        res.end();
      }
    }
  },
);

await setupUsersTable();
await setupResetTokensTable();
await triggerUnverifiedUsersCleanup();
await triggerTokenCleanup();

server.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
