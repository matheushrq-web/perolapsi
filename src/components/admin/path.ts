/** Leitura e escrita imutável por caminho ("hero.image.focalX", "faq.items.2.answer") */

export function getAt(obj: unknown, path: string): unknown {
  if (!path) return obj;
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc == null) return undefined;
    return (acc as Record<string, unknown>)[key];
  }, obj);
}

export function setAt<T>(obj: T, path: string, value: unknown): T {
  const keys = path.split(".");
  const walk = (node: unknown, i: number): unknown => {
    const key = keys[i];
    const isArr = Array.isArray(node);
    const copy: Record<string, unknown> | unknown[] = isArr
      ? [...(node as unknown[])]
      : { ...((node as Record<string, unknown>) ?? {}) };
    const current = (copy as Record<string, unknown>)[key];
    (copy as Record<string, unknown>)[key] = i === keys.length - 1 ? value : walk(current, i + 1);
    return copy;
  };
  return walk(obj, 0) as T;
}

export const join = (...parts: (string | number)[]) => parts.filter((p) => p !== "").join(".");
