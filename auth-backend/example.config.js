// Fill this in with the values received after creating a Google OAuth2
// credentials
export const googleClientId='aaaaaaaaaaaa-bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb.apps.googleusercontent.com';
export const googleClientSecret='AAAAAA-BBBBBBBBBBBBBBBBBBBBBBBBBBBB';

// Replace kgbd... with the ID of the extension
export const googleClientRedirectUrl='https://kgbbebdcmdgkbopcffmpgkgcmcoomhmh.chromiumapp.org/';

// Restrict access to the API to certain origins only. Replace kgbd..
// with the ID of your extension. Or, you can allow access to the API from all
// origins by setting ACCESS_CONTROL_ALLOW_ORIGIN=*
export const accessControlAllowOrigin='chrome-extension://kgbbebdcmdgkbopcffmpgkgcmcoomhmh';

// The URL at which the /api/auth endpoint from the auth-backend is hosted
export const productionAuthUrl = 'https://calendar-plus.patii.uk/api/auth';
export const developmentAuthUrl = 'http://localhost:3000/api/auth';