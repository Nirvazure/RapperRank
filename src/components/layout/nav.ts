export type MainNavKey = "rating" | "community" | "label" | "art";

export function getMainNavActive(pathname: string): Record<MainNavKey, boolean> {
  return {
    rating: pathname === "/" || pathname.startsWith("/rank/"),
    community: pathname === "/ranking",
    label: pathname === "/label",
    art: pathname === "/art",
  };
}
