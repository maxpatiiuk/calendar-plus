import { listen } from '../events';

test('listen', () => {
  const element = new EventTarget();
  const callback = jest.fn();
  const destructor = listen(element, 'click', callback);
  expect(callback).not.toHaveBeenCalled();
  element.dispatchEvent(new MouseEvent('click'));
  expect(callback).toHaveBeenCalledTimes(1);
  destructor();
  element.dispatchEvent(new MouseEvent('click'));
  expect(callback).toHaveBeenCalledTimes(1);
});
