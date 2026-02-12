import { Badge } from "@/components/ui/badge";

const STAGE_CONFIG: Record<string, { label: string; color: string }> = {
  submitted: { label: "Submitted", color: "bg-[#3B82F6]" },
  to_interview: { label: "Interview", color: "bg-[#F59E0B]" },
  approved: { label: "Approved", color: "bg-[#10B981]" },
  rejected: { label: "Rejected", color: "bg-[#EF4444]" },
};

export function StageBadge({ stage }: { stage: string }) {
  const config = STAGE_CONFIG[stage] ?? { label: stage, color: "bg-gray-500" };
  return (
    <Badge className={`${config.color} text-white`}>
      {config.label}
    </Badge>
  );
}

export { STAGE_CONFIG };
