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
   cd auth-backend
   ```

2. Create
   [Google OAuth2 client](https://github.com/googleapis/google-api-nodejs-client?tab=readme-ov-file#oauth2-client)

   - Create 2 clients - one for development, another for production
   - Set type to "Web application"
   - Set authorized redirect URI to `https://EXTENSION_ID.chromiumapp.org/`
     (replace `EXTENSION_ID` with the extension ID)
   - For development set:
     - Authorized redirect URIs: `https://calendar-plus.patii.uk/api/route`
   - For production set:
     - Authorized JavaScript origins: set to domain on which `auth-backend` will
       be hosted (`https://calendar-plus.patii.uk`)

3. Copy [./example.config.js](./example.config.js) into `./config.js` and fill
   it in according to instructions in that file and the credentials you received
   in the previous file. Fill it out with development credentials in
   development, and production credentials when the app is deployed to Vercel.

4. Install dependencies:

   ```sh
   npm install
   ```

### Development

1. Run `npm run dev` to start the development server

### Production

1. Create new vercel.com project from this repository
2. Change the "Root Directory" setting to current directory
   (/packages/auth-backend)
