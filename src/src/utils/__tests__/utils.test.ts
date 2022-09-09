import {camelToHuman, capitalize} from '../utils';
import {theories} from '../../tests/utils';

theories(capitalize, {
  'simple case': { in: ['capitalize'], out: 'Capitalize' },
  'works with non-ascii characters': { in: ['çA'], out: 'ÇA' },
  'does not break emojis': { in: ['❤️'], out: '❤️' },
});

theories(camelToHuman, [{ in: ['camelCase'], out: 'Camel Case' }]);
