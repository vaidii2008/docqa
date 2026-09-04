import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Testing Library mounts into a shared document, so without this a component
// from one test is still in the DOM during the next and queries match the
// wrong element.
afterEach(() => {
  cleanup();
});
