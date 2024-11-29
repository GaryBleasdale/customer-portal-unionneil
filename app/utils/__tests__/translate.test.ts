import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import T from '../translate';

describe('Translate Utility', () => {
  // Save original navigator
  const originalNavigator = global.navigator;
  
  beforeAll(() => {
    // Mock window and navigator for tests
    Object.defineProperty(global, 'window', {
      value: {},
      writable: true
    });
    
    Object.defineProperty(global, 'navigator', {
      value: {
        language: 'en'
      },
      writable: true
    });
  });

  afterAll(() => {
    // Restore original navigator
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      writable: true
    });
  });

  it('should translate login texts to English', () => {
    // @ts-ignore - We know navigator exists in our test environment
    global.navigator.language = 'en';
    
    expect(T('login.sign-in-to-your-account')).toBe('Sign in to your account');
    expect(T('login.email-address')).toBe('Email address');
    expect(T('login.password')).toBe('Password');
  });

  it('should translate login texts to Portuguese', () => {
    // @ts-ignore - We know navigator exists in our test environment
    global.navigator.language = 'pt-BR';
    
    expect(T('login.sign-in-to-your-account')).toBe('Entrar na sua conta');
    expect(T('login.email-address')).toBe('Endereço de email');
    expect(T('login.password')).toBe('Senha');
  });

  it('should translate navbar texts to English', () => {
    // @ts-ignore - We know navigator exists in our test environment
    global.navigator.language = 'en';
    
    expect(T('navbar.dashboard')).toBe('Dashboard');
    expect(T('navbar.profile')).toBe('Profile');
    expect(T('navbar.settings')).toBe('Settings');
  });

  it('should translate navbar texts to Portuguese', () => {
    // @ts-ignore - We know navigator exists in our test environment
    global.navigator.language = 'pt-BR';
    
    expect(T('navbar.dashboard')).toBe('Painel');
    expect(T('navbar.profile')).toBe('Perfil');
    expect(T('navbar.settings')).toBe('Configurações');
  });

  it('should default to Portuguese for unsupported languages', () => {
    // @ts-ignore - We know navigator exists in our test environment
    global.navigator.language = 'fr';
    
    expect(T('login.password')).toBe('Senha');
    expect(T('navbar.dashboard')).toBe('Painel');
  });
});
