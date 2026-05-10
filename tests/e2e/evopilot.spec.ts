import { expect, test } from "@playwright/test";

test("founder workflow: add mvp, add task, generate prompt, change status, view dashboard", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Founder HQ" })).toBeVisible();

  await page.getByRole("link", { name: "Add MVP" }).first().click();
  await page.getByLabel("Project name").fill("Pilot Shop");
  await page.getByLabel("GitHub repo URL").fill("https://github.com/acme/pilot-shop");
  await page.getByLabel("Production URL").fill("https://pilot-shop.example.com");
  await page.getByLabel("Test command").fill("npm test");
  await page.getByLabel("Playwright command").fill("npx playwright test");
  await page.getByRole("button", { name: "Create MVP" }).click();

  await expect(page.getByRole("heading", { name: "Pilot Shop" })).toBeVisible();

  await page.getByRole("link", { name: "Add Issue Manually" }).click();
  await page.getByLabel("Title").fill("Checkout button is unresponsive");
  await page.getByLabel("Type").selectOption("Bug");
  await page.getByLabel("Severity").selectOption("High");
  await page.getByLabel("Source").selectOption("Manual");
  await page.getByLabel("Page URL").fill("/checkout");
  await page.getByLabel("Error message").fill("Button click does nothing");
  await page.getByLabel("Steps to reproduce").fill("Open checkout and click Pay now");
  await page.getByLabel("Expected behavior").fill("Payment should begin");
  await page.getByLabel("Actual behavior").fill("No action occurs");
  await page.getByLabel("Logs").fill("No frontend errors");
  await page.getByRole("button", { name: "Create Improvement Task" }).click();

  await expect(page.getByRole("heading", { name: "Checkout button is unresponsive" })).toBeVisible();
  await page.getByRole("button", { name: "Generate Fix Prompt" }).click();

  await expect(page.getByText("Generated Fix Prompt")).toBeVisible();
  await expect(page.getByText("Do NOT auto-deploy to production.")).toBeVisible();

  await page.getByLabel("status").selectOption("Investigating");
  await page.getByRole("button", { name: "Update Status" }).click();
  await expect(page.getByText("Investigating")).toBeVisible();

  await page.getByRole("link", { name: "Dashboard" }).click();
  await expect(page.getByText("Connected MVPs")).toBeVisible();
  await expect(page.getByText("Open Issues")).toBeVisible();
});
