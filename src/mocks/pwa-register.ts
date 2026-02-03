// Mock implementation for extension build where PWA plugin is absent
export function useRegisterSW() {
  return {
    needRefresh: [false, () => {}],
    updateServiceWorker: () => {},
  };
}
