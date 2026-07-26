import { listen } from '../events';
import { expect, test, vi } from 'vitest';

test('listen', () => {
  const element = new EventTarget();
  const callback = vi.fn();
  const destructor = listen(element, 'click', callback);
  expect(callback).not.toHaveBeenCalled();
  element.dispatchEvent(new MouseEvent('click'));
  expect(callback).toHaveBeenCalledTimes(1);
  destructor();
  element.dispatchEvent(new MouseEvent('click'));
  expect(callback).toHaveBeenCalledTimes(1);
});
