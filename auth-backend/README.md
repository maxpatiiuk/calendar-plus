# Auth Backend

Google OAuth2 API does not allow for long-lived tokens in front-end applications
(the token only lasts 1 hour, after which user must be explicitly prompted
again - bad UX).

This backend is used to generate a more-persistent token.

## Installation

Clone this repository and open current folder:

```sh
git clone https://github.com/maxpatiiuk/calendar-plus
cd calendar-plus
cd auth-backend
```

Install dependencies:

```sh
npm install
```

## Deployment

### Development

1. Copy [./example.env.local](./example.env.local) into `.env.local` and fill it
   in according to instructions in that file.
2. Run `npm install`
3. Run `npm run dev` to start the development server
4. The server will be accessible on the `http://localhost:3000` address.

   Note, if you try to open this URL in the browser, you will see a 405 error -
   that is expected, as the server only accepts POST requests.

   Copy this URL as it will be needed later.

### Production

1. Create new vercel.com project from this repository
2. Change the "Root Directory" setting to current directory
   (/packages/cors-auth-middleware)
3. Set up the environmental variables according to the instructions in the
   `example.env.local` file
4. Keep note of the URL at which the project is deployed - you will need it
   later
