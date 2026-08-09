interface HeatmapSquareProps {
  date: string;
  count: number;
  level: number;
}

export default function HeatmapSquare({
  date,
  count,
  level,
}: HeatmapSquareProps) {
  const levels = [
    "bg-gray-100",
    "bg-green-200",
    "bg-green-400",
    "bg-green-600",
    "bg-green-800",
  ];

  return (
    <div
      title={`${count} contribution${
        count !== 1 ? "s" : ""
      } on ${date}`}
      aria-label={`${count} contribution${
        count !== 1 ? "s" : ""
      } on ${date}`}
      className={`h-3.5 w-3.5 shrink-0 rounded-sm ${levels[level]}`}
    />
  );
}