import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Toast } from "antd-mobile";
import { clearCompletedReminders } from "@/api/reminderApi";
export function useClearCompletedReminders(onCleared?: () => void) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids?: string[]) => clearCompletedReminders(ids),
    onSuccess: (deleted) => {
      qc.invalidateQueries({ queryKey: ["reminders"] });
      onCleared?.();
      Toast.show({ icon: "success", content: `Cleared ${deleted}` });
    },
    onError: (err: Error) => Toast.show({ icon: "fail", content: err.message }),
  });
}
