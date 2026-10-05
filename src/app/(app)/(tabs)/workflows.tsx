import { ComingSoon } from "@/components/coming-soon";
import { Workflow } from "@/lib/icons";

/** Workflows tab — placeholder. Web: /portal/[adviceId]/workflows (+ pipeline boards). */
export default function WorkflowsScreen() {
  return (
    <ComingSoon
      title="Workflows"
      icon={Workflow}
      headline="Keep every client moving"
      description="Follow clients through your workflow stages and tick off checklists as work gets done."
      features={["Your workflows and their stages", "Clients in each stage", "Checklists and comments"]}
    />
  );
}
