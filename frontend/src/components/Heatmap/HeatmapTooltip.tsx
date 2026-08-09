interface HeatmapTooltipProps {
  date: string;
  count: number;
}

export default function HeatmapTooltip({
  date,
  count,
}: HeatmapTooltipProps) {
  return (
    <div className="absolute bottom-full left-1/2 z-50 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-3 py-2 text-xs text-white group-hover:block">
      <div className="font-medium">
        {count} contribution{count !== 1 ? "s" : ""}
      </div>

      <div className="text-gray-300">
        {date}
      </div>
    </div>
  );
}