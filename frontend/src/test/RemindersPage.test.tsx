/// <reference types="vitest/globals" />
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import RemindersPage from "@/pages/RemindersPage";
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
function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
}
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
