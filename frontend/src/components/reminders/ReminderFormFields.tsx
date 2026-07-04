import { Form, Input, TextArea, DatePicker, Picker } from "antd-mobile";
import dayjs from "dayjs";
import { notifyWhenOptions, notifyMsgCountOptions } from "@/utils/notify";
import { timeColumns, formatTime12, type Time12 } from "@/utils/time";
import { TITLE_MAX_WORDS, NOTES_MAX_WORDS, enforceWordLimit, wordLimitRule } from "@/utils/wordLimit";
type Props = {
  date: Date;
  onDateChange: (d: Date) => void;
  time: Time12;
  onTimeChange: (t: Time12) => void;
  notify: string;
  onNotifyChange: (v: string) => void;
  msgCount: string;
  onMsgCountChange: (v: string) => void;
};
export default function ReminderFormFields({ date, onDateChange, time, onTimeChange, notify, onNotifyChange, msgCount, onMsgCountChange }: Props) {
  return (
    <>
      <Form.Item name="title" label="Title" normalize={(v) => enforceWordLimit(v ?? "", TITLE_MAX_WORDS)} rules={[{ required: true, message: "Title is required" }, wordLimitRule(TITLE_MAX_WORDS, "Title")]}>
        <Input placeholder="Morning workout" />
      </Form.Item>
      <Form.Item label="Date">
        <DatePicker title="Select date" value={date} onConfirm={onDateChange}>
          {(val, actions) => (
            <button type="button" className="ig-field-value" onClick={actions.open}>
              {dayjs(val).format("MMM D, YYYY")}
            </button>
          )}
        </DatePicker>
      </Form.Item>
      <Form.Item label="Time">
        <Picker title="Select time" columns={timeColumns} value={time} onConfirm={(v) => onTimeChange(v as Time12)}>
          {(_, actions) => (
            <button type="button" className="ig-field-value" onClick={actions.open}>
              {formatTime12(time)}
            </button>
          )}
        </Picker>
      </Form.Item>
      <Form.Item name="notes" label="Notes" normalize={(v) => enforceWordLimit(v ?? "", NOTES_MAX_WORDS)} rules={[wordLimitRule(NOTES_MAX_WORDS, "Notes")]}>
        <TextArea placeholder="Extra details (sent with title in Telegram)..." rows={3} />
      </Form.Item>
      <Form.Item label="Notify when">
        <Picker title="Notify when" columns={notifyWhenOptions} value={[notify]} onConfirm={(v) => onNotifyChange(v[0] as string)}>
          {(_, actions) => (
            <button type="button" className="ig-field-value ig-field-value--muted" onClick={actions.open}>
              {notify}
            </button>
          )}
        </Picker>
      </Form.Item>
      <Form.Item label="Messages to send">
        <Picker title="Messages to send" columns={notifyMsgCountOptions} value={[msgCount]} onConfirm={(v) => onMsgCountChange(v[0] as string)}>
          {(_, actions) => (
            <button type="button" className="ig-field-value ig-field-value--muted" onClick={actions.open}>
              {msgCount} message{msgCount === "1" ? "" : "s"}
            </button>
          )}
        </Picker>
      </Form.Item>
    </>
  );
}
