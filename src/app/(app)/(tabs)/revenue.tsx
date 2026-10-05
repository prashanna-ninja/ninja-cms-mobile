import { ComingSoon } from "@/components/coming-soon";
import { ChartLine } from "@/lib/icons";

/** Revenue tab — placeholder. Web: /portal/[adviceId]/my-revenue. */
export default function RevenueScreen() {
  return (
    <ComingSoon
      title="Revenue"
      icon={ChartLine}
      headline="Your revenue at a glance"
      description="See what's come in, where it came from and which clients it belongs to."
      features={["Revenue totals and trends", "Recent transactions", "Revenue by client"]}
    />
  );
}
