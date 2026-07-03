import { ErrorBlock } from "antd-mobile";
export default function ErrorState({ message }: { message: string }) {
  return <ErrorBlock status="default" title="Something went wrong" description={message} />;
}
