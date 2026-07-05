import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Toast } from "antd-mobile";
import { completeReminder } from "@/api/reminderApi";
export function useCompleteReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: completeReminder,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reminders"] });
      Toast.show({ icon: "success", content: "Done!" });
    },
    onError: (err: Error) => Toast.show({ icon: "fail", content: err.message }),
  });
}
