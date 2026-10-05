import { ComingSoon } from "@/components/coming-soon";
import { Users } from "@/lib/icons";

/** Clients tab — placeholder. Web: /portal/[adviceId]/client-records (+ clients, groups). */
export default function ClientsScreen() {
  return (
    <ComingSoon
      title="Clients"
      icon={Users}
      headline="Your client records, in your pocket"
      description="Look up clients, see their details and keep notes — the same records as your adviser portal."
      features={["Search and browse client records", "Client profiles, notes and files", "Groups and tags"]}
    />
  );
}
