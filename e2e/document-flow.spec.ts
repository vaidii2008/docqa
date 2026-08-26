import { test, expect } from "@playwright/test";
import path from "path";

test("sign up, log in, and upload a document to READY", async ({ page }) => {
  // Unique email per run so re-runs never collide on "email already exists".
  const email = `e2e-${Date.now()}@example.com`;
  const password = "password123";

  // 1. Sign up.
  await page.goto("/signup");
  await page.fill("#name", "E2E User");
  await page.fill("#email", email);
  await page.fill("#password", password);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByText("Account created")).toBeVisible();

  // 2. Log in.
  await page.goto("/login");
  await page.fill("#email", email);
  await page.fill("#password", password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(
    page.getByRole("heading", { name: "My Documents" }),
  ).toBeVisible();

  // 3. Upload the PDF fixture.
  await page.setInputFiles(
    "#file",
    path.join(process.cwd(), "e2e/fixtures/sample.pdf"),
  );
  await page.getByRole("button", { name: "Upload", exact: true }).click();

  // 4. Wait for ingestion (parse + chunk + embed) to finish and flip to READY.
  await expect(page.getByText("READY")).toBeVisible({ timeout: 60_000 });
});
