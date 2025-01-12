interface MaturityBadgeProps {
  state: "SEED" | "SAPLING" | "GROWTH" | "MATURE" | "EVOLVING";
  className?: string;
}

const maturityColors = {
  SEED: "bg-yellow-100 text-yellow-800",
  SAPLING: "bg-green-100 text-green-800",
  GROWTH: "bg-blue-100 text-blue-800",
  MATURE: "bg-purple-100 text-purple-800",
  EVOLVING: "bg-indigo-100 text-indigo-800",
};

const maturityDescriptions = {
  SEED: "Initial idea or concept",
  SAPLING: "Early development stage",
  GROWTH: "Active development and refinement",
  MATURE: "Well-developed and stable",
  EVOLVING: "Undergoing significant changes",
};

export default function MaturityBadge({
  state,
  className = "",
}: MaturityBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${maturityColors[state]} ${className}`}
      title={maturityDescriptions[state]}
    >
      {state.charAt(0) + state.slice(1).toLowerCase()}
    </span>
  );
}
