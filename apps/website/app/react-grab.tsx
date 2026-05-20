"use client";

export function ReactGrab() {
  // Budge's shipped runtime uses react-grab/primitives directly. Avoid
  // initializing the full React Grab overlay here so the two tools can coexist.
  return null;
}
