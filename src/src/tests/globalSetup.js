/** Make all tests use UTC, rather than local time zone */
export default function globalSetup() {
  process.env.TZ = 'UTC';
}
