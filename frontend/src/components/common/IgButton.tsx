import { Button, type ButtonProps } from "antd-mobile";
type IgButtonVariant = "primary" | "outline" | "text" | "danger";
interface IgButtonProps extends Omit<ButtonProps, "color" | "fill"> {
  variant?: IgButtonVariant;
}
export default function IgButton({ variant = "primary", className = "", block, size = "middle", ...props }: IgButtonProps) {
  const cls = ["ig-btn", `ig-btn--${variant}`, block ? "ig-btn--block" : "", className].filter(Boolean).join(" ");
  if (variant === "primary") {
    return <Button {...props} block={block} size={size} color="primary" className={cls} />;
  }
  if (variant === "danger") {
    return <Button {...props} block={block} size={size} color="danger" fill="outline" className={cls} />;
  }
  if (variant === "text") {
    return <Button {...props} block={block} size={size} fill="none" color="primary" className={cls} />;
  }
  return <Button {...props} block={block} size={size} fill="outline" className={cls} />;
}
