/**
 * Make all tests use CDT, rather than local time zone
 * The choice of CDT is almost arbitrary, but it's a time zone that is not UTC
 * to better reflect the real world.
 */
export default () => {
  process.env.TZ = 'UTC-5:00';
};
