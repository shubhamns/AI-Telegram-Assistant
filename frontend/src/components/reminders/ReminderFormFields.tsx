import { Form, Input, TextArea, DatePicker, Picker } from "antd-mobile";
import dayjs from "dayjs";
import { notifyOptions } from "@/utils/notify";
import { timeColumns, formatTime12, type Time12 } from "@/utils/time";
type Props = {
  date: Date;
  onDateChange: (d: Date) => void;
  time: Time12;
  onTimeChange: (t: Time12) => void;
  notify: string;
  onNotifyChange: (v: string) => void;
};
export default function ReminderFormFields({ date, onDateChange, time, onTimeChange, notify, onNotifyChange }: Props) {
  return (
    <>
      <Form.Item name="title" label="Title" rules={[{ required: true, message: "Title is required" }]}>
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
      <Form.Item name="notes" label="Notes">
        <TextArea placeholder="Optional notes..." rows={3} />
      </Form.Item>
      <Form.Item label="Notify me">
        <Picker title="Notify me" columns={notifyOptions} value={[notify]} onConfirm={(v) => onNotifyChange(v[0] as string)}>
          {(_, actions) => (
            <button type="button" className="ig-field-value ig-field-value--muted" onClick={actions.open}>
              {notify}
            </button>
          )}
        </Picker>
      </Form.Item>
    </>
  );
}
