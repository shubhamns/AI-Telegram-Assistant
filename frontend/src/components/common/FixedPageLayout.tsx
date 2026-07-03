import type { ReactNode } from "react";
interface FixedPageLayoutProps {
  header: ReactNode;
  subHeader?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}
export default function FixedPageLayout({ header, subHeader, children, footer }: FixedPageLayoutProps) {
  return (
    <div className="page-layout">
      <div className="page-header-fixed">{header}</div>
      {subHeader && <div className="page-subheader-fixed">{subHeader}</div>}
      <div className="page-body-scroll">{children}</div>
      {footer && <div className="page-footer-fixed">{footer}</div>}
    </div>
  );
}
