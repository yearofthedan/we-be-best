import Vue from 'vue';
import registerLogger from './logger';

describe('logger', () => {
  it('logs an error', () => {
    const errorSpy = jest.spyOn(console, 'error').mockReturnValue();

    registerLogger();

    Vue.prototype.$logger.error('some error');

    expect(errorSpy).toHaveBeenCalledWith('some error');
  });
});
