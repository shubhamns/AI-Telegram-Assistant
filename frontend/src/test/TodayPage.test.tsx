/// <reference types="vitest/globals" />
import { screen } from "@testing-library/react";
import { vi } from "vitest";
import TodayPage from "@/pages/TodayPage";
import { renderWithProviders } from "@/test/renderWithProviders";
vi.mock("../api/reminderApi", () => ({
  fetchReminders: vi.fn().mockResolvedValue([]),
  completeReminder: vi.fn(),
}));
vi.mock("../api/telegramApi", () => ({
  fetchTelegramStatus: vi.fn().mockResolvedValue({ connected: true, userDisplayName: "Alex", mode: "polling" }),
}));
describe("TodayPage", () => {
  it("renders today plan", async () => {
    renderWithProviders(<TodayPage />);
    expect(await screen.findByText(/Alex/)).toBeInTheDocument();
    expect(await screen.findByText(/No tasks for today|done today/i)).toBeTruthy();
    expect(await screen.findByText("Add")).toBeInTheDocument();
  });
});
