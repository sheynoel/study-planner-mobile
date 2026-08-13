export function createSingleFlight<T>() {
  let active: Promise<T> | null = null;
  return (operation: () => Promise<T>): Promise<T> => {
    active ??= operation().finally(() => { active = null; });
    return active;
  };
}
