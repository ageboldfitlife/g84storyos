import { useEffect } from 'react';

export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  modifiers: { ctrl?: boolean; meta?: boolean; shift?: boolean } = {}
) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const ctrlMatch = modifiers.ctrl ? e.ctrlKey : true;
      const metaMatch = modifiers.meta ? e.metaKey : true;
      const shiftMatch = modifiers.shift ? e.shiftKey : true;
      if (e.key === key && ctrlMatch && metaMatch && shiftMatch) {
        e.preventDefault();
        callback();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [key, callback, modifiers]);
}