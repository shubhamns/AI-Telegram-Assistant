/// <reference types="vitest/globals" />
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import TodayPage from "@/pages/TodayPage";
vi.mock("../api/reminderApi", () => ({
  fetchReminders: vi.fn().mockResolvedValue([]),
  completeReminder: vi.fn(),
}));
vi.mock("../api/telegramApi", () => ({
  fetchTelegramStatus: vi.fn().mockResolvedValue({ connected: true, userDisplayName: "Alex", mode: "polling" }),
}));
function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
}
describe("TodayPage", () => {
  it("renders today plan", async () => {
    renderWithProviders(<TodayPage />);
    expect(await screen.findByText(/Alex/)).toBeInTheDocument();
    expect(await screen.findByText(/No tasks for today|done today/i)).toBeTruthy();
    expect(await screen.findByText("Add")).toBeInTheDocument();
  });
});
