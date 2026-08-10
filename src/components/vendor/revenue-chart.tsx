"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export function RevenueChart({
  data,
}: {
  data: { date: string; revenue: number }[];
}) {
  const tc = useTranslations("common");
  const t = useTranslations("vendorDashboard");
  const [hovered, setHovered] = useState<number | null>(null);
  const [showTable, setShowTable] = useState(false);

  const max = Math.max(...data.map((d) => d.revenue), 1);
  const width = 600;
  const height = 160;
  const gap = 2;
  const barWidth = width / data.length - gap;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-medium text-zinc-900 dark:text-zinc-50">
          {t("revenueLast30Days")}
        </h3>
        <button
          onClick={() => setShowTable((v) => !v)}
          className="text-xs text-persian-700 underline hover:no-underline dark:text-persian-300"
        >
          {showTable ? t("viewChart") : t("viewTable")}
        </button>
      </div>

      {showTable ? (
        <div className="max-h-64 overflow-y-auto rounded-md border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-zinc-50 dark:bg-zinc-900">
              <tr>
                <th className="px-3 py-2 text-start font-medium">{tc("currency")}</th>
                <th className="px-3 py-2 text-end font-medium">
                  {t("revenueLast30Days")}
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr key={d.date} className="border-t border-zinc-100 dark:border-zinc-800">
                  <td className="px-3 py-1.5">{d.date}</td>
                  <td className="px-3 py-1.5 text-end">{d.revenue.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="relative">
          <svg
            viewBox={`0 0 ${width} ${height + 20}`}
            className="w-full"
            role="img"
            aria-label={t("revenueLast30Days")}
          >
            <line
              x1={0}
              y1={height}
              x2={width}
              y2={height}
              stroke="currentColor"
              className="text-zinc-200 dark:text-zinc-800"
              strokeWidth={1}
            />
            {data.map((d, i) => {
              const barHeight = (d.revenue / max) * (height - 8);
              const x = i * (barWidth + gap);
              const isHovered = hovered === i;
              return (
                <rect
                  key={d.date}
                  x={x}
                  y={height - barHeight}
                  width={Math.max(barWidth, 1)}
                  height={barHeight}
                  rx={2}
                  className={
                    isHovered
                      ? "fill-persian-700 dark:fill-persian-400"
                      : "fill-persian-500 dark:fill-persian-600"
                  }
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                />
              );
            })}
          </svg>
          {hovered !== null && (
            <div className="pointer-events-none absolute top-0 rounded-md bg-zinc-900 px-2 py-1 text-xs text-white dark:bg-zinc-100 dark:text-zinc-900">
              {data[hovered].date}: {data[hovered].revenue.toFixed(2)} {tc("currency")}
            </div>
          )}
          <div className="mt-1 flex justify-between text-xs text-zinc-400">
            <span>{data[0]?.date}</span>
            <span>{data[data.length - 1]?.date}</span>
          </div>
        </div>
      )}
    </div>
  );
}
