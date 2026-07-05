/// <reference types="vitest/globals" />
import { screen } from "@testing-library/react";
import { vi } from "vitest";
import RemindersPage from "@/pages/RemindersPage";
import { renderWithProviders } from "@/test/renderWithProviders";
const { mockReminders } = vi.hoisted(() => ({
  mockReminders: [
    { _id: "1", telegramChatId: "123", title: "Gym", scheduledAt: new Date().toISOString(), timezone: "Asia/Kolkata", status: "pending" as const, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ],
}));
vi.mock("../api/reminderApi", () => ({
  fetchReminders: vi.fn().mockResolvedValue(mockReminders),
  completeReminder: vi.fn(),
  clearCompletedReminders: vi.fn(),
}));
describe("RemindersPage", () => {
  it("renders reminders list", async () => {
    renderWithProviders(<RemindersPage />);
    expect(await screen.findByText("Reminders")).toBeInTheDocument();
    expect(await screen.findByText("Gym")).toBeInTheDocument();
  });
  it("shows tab controls", async () => {
    renderWithProviders(<RemindersPage />);
    expect(await screen.findByText("Upcoming")).toBeInTheDocument();
    expect(await screen.findByText("Completed")).toBeInTheDocument();
  });
});
