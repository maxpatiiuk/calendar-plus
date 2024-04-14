# Auth Backend

Google OAuth2 API does not allow for long-lived tokens in front-end applications
(the token only lasts 1 hour, after which user must be explicitly prompted
again - bad UX).

This backend is used to generate a more-persistent token.

## Installation

1. Clone this repository and open current folder:

   ```sh
   git clone https://github.com/maxpatiiuk/calendar-plus
   cd calendar-plus
   cd backend
   ```

2. Create
   [Google OAuth2 client](https://github.com/googleapis/google-api-nodejs-client?tab=readme-ov-file#oauth2-client)

   - Create 2 Client ides - one for development, another for production
   - Set type to "Web application"
   - Set authorized redirect URI to
     `https://kgbbebdcmdgkbopcffmpgkgcmcoomhmh.chromiumapp.org/` (replace
     `kgbb...` with the extension ID)

3. (optional) Edit the configuration in [./.env](./.env),
   [./.env.development](./.env.development) and
   [./.env.production](./.env.production)

4. Copy [./.env.example](./.env.example) into `./.env.development.local` and
   `./.env.production.local` and fill it in according to the instructions in
   that file and the credentials you received in the previous step.

5. Install dependencies:

   ```sh
   npm install
   ```

### Development

1. Run `npm run dev` to start the development server

### Production

1. Create new vercel.com project from this repository
2. Change the "Root Directory" setting to current directory (/packages/backend)
3. Set environment variables as per `./.env.production.local`
