import HeatmapSquare from "./HeatmapSquare";

interface ContributionDay {
  date: string;
  contributionCount: number;
}

interface HeatmapProps {
  activeDays: ContributionDay[];
}

interface HeatmapDay {
  date: string;
  count: number;
}

function formatDate(date: Date) {
  // IMPORTANT:
  // Do not use toISOString() here.
  // It converts local midnight to UTC and can shift
  // the date by one day.
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getLevel(count: number) {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 9) return 3;

  return 4;
}

function startOfWeek(date: Date) {
  const result = new Date(date);

  result.setHours(0, 0, 0, 0);

  // Sunday = 0
  result.setDate(
    result.getDate() - result.getDay(),
  );

  return result;
}

function endOfWeek(date: Date) {
  const result = new Date(date);

  result.setHours(0, 0, 0, 0);

  result.setDate(
    result.getDate() + (6 - result.getDay()),
  );

  return result;
}

export default function Heatmap({
  activeDays,
}: HeatmapProps) {

  /*
   * Convert GitHub contribution data
   * into a quick lookup map.
   */
  const contributionMap =
    new Map<string, number>();

  for (const day of activeDays) {
    contributionMap.set(
      day.date,
      day.contributionCount,
    );
  }

  /*
   * Today.
   */
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  /*
   * Last 365 days.
   */
  const oneYearAgo = new Date(today);

  oneYearAgo.setDate(
    oneYearAgo.getDate() - 364,
  );

  /*
   * Make complete Sunday → Saturday weeks.
   */
  const calendarStart =
    startOfWeek(oneYearAgo);

  const calendarEnd =
    endOfWeek(today);

  /*
   * Create every calendar day.
   */
  const days: HeatmapDay[] = [];

  const cursor =
    new Date(calendarStart);

  while (cursor <= calendarEnd) {

    const date =
      formatDate(cursor);

    days.push({
      date,
      count:
        contributionMap.get(date) ?? 0,
    });

    cursor.setDate(
      cursor.getDate() + 1,
    );
  }

  /*
   * Split days into weeks.
   *
   * Every week is:
   *
   * [Sunday]
   * [Monday]
   * [Tuesday]
   * [Wednesday]
   * [Thursday]
   * [Friday]
   * [Saturday]
   */
  const weeks: HeatmapDay[][] = [];

  for (
    let i = 0;
    i < days.length;
    i += 7
  ) {
    weeks.push(
      days.slice(i, i + 7),
    );
  }

  /*
   * Month labels.
   *
   * Each month gets exactly one label,
   * positioned on the first Sunday
   * belonging to that month.
   */
  const monthLabels =
    new Map<number, string>();

  const assignedMonths =
    new Set<string>();

  const firstDayOfMonth =
    new Date(oneYearAgo);

  firstDayOfMonth.setDate(1);
  firstDayOfMonth.setHours(0, 0, 0, 0);

  while (firstDayOfMonth <= today) {

    const year =
      firstDayOfMonth.getFullYear();

    const month =
      firstDayOfMonth.getMonth();

    const monthKey =
      `${year}-${month}`;

    /*
     * Find first Sunday of this month.
     */
    const firstSunday =
      new Date(firstDayOfMonth);

    const dayOfWeek =
      firstSunday.getDay();

    if (dayOfWeek !== 0) {
      firstSunday.setDate(
        firstSunday.getDate() +
          (7 - dayOfWeek),
      );
    }

    const sundayDate =
      formatDate(firstSunday);

    /*
     * Find which week contains it.
     */
    const weekIndex =
      weeks.findIndex(
        (week) =>
          week.some(
            (day) =>
              day.date === sundayDate,
          ),
      );

    if (
      weekIndex !== -1 &&
      !assignedMonths.has(monthKey)
    ) {

      monthLabels.set(
        weekIndex,
        firstDayOfMonth.toLocaleString(
          "en-US",
          {
            month: "short",
          },
        ),
      );

      assignedMonths.add(
        monthKey,
      );
    }

    /*
     * Next month.
     */
    firstDayOfMonth.setMonth(
      firstDayOfMonth.getMonth() + 1,
    );
  }

  /*
   * Total contributions.
   */
  const totalContributions =
    activeDays.reduce(
      (total, day) =>
        total + day.contributionCount,
      0,
    );

  return (
    <section className="rounded-2xl border bg-white p-4 shadow-sm sm:p-6">

      {/* Header */}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>

          <h2 className="text-lg font-semibold text-gray-900">
            Contributions
          </h2>

          <p className="text-sm text-gray-500">
            {totalContributions} contributions
            in the last year
          </p>

        </div>

        {/* Legend */}

        <div className="flex items-center gap-2 text-xs text-gray-500">

          <span>
            Less
          </span>

          <div className="h-3.5 w-3.5 rounded-sm bg-gray-100" />

          <div className="h-3.5 w-3.5 rounded-sm bg-green-200" />

          <div className="h-3.5 w-3.5 rounded-sm bg-green-400" />

          <div className="h-3.5 w-3.5 rounded-sm bg-green-600" />

          <div className="h-3.5 w-3.5 rounded-sm bg-green-800" />

          <span>
            More
          </span>

        </div>

      </div>

      {/* Heatmap */}

      <div className="overflow-x-auto pb-2">

        <div className="min-w-[760px]">

          {/* Months */}

          <div className="mb-2 ml-9 flex">

            {weeks.map(
              (_, weekIndex) => (

                <div
                  key={weekIndex}
                  className="mr-[3px] h-4 w-3.5 shrink-0 text-[11px] text-gray-500"
                >
                  {
                    monthLabels.get(
                      weekIndex,
                    ) ?? ""
                  }
                </div>

              ),
            )}

          </div>

          <div className="flex">

            {/* Weekday labels */}

            <div className="mr-2 flex w-7 shrink-0 flex-col gap-[3px]">

              {/* Sunday */}

              <div className="h-3.5" />

              {/* Monday */}

              <div className="h-3.5 text-[10px] leading-3.5 text-gray-500">
                Mon
              </div>

              {/* Tuesday */}

              <div className="h-3.5" />

              {/* Wednesday */}

              <div className="h-3.5 text-[10px] leading-3.5 text-gray-500">
                Wed
              </div>

              {/* Thursday */}

              <div className="h-3.5" />

              {/* Friday */}

              <div className="h-3.5 text-[10px] leading-3.5 text-gray-500">
                Fri
              </div>

              {/* Saturday */}

              <div className="h-3.5" />

            </div>

            {/* Grid */}

            <div className="flex gap-[3px]">

              {weeks.map(
                (week, weekIndex) => (

                  <div
                    key={weekIndex}
                    className="flex w-3.5 shrink-0 flex-col gap-[3px]"
                  >

                    {Array.from({
                      length: 7,
                    }).map(
                      (_, dayIndex) => {

                        const day =
                          week[dayIndex];

                        if (!day) {
                          return (
                            <div
                              key={dayIndex}
                              className="h-3.5 w-3.5"
                            />
                          );
                        }

                        return (
                          <HeatmapSquare
                            key={day.date}
                            date={day.date}
                            count={day.count}
                            level={getLevel(
                              day.count,
                            )}
                          />
                        );
                      },
                    )}

                  </div>

                ),
              )}

            </div>

          </div>

        </div>

      </div>

      <p className="mt-2 text-center text-xs text-gray-400 sm:hidden">
        Swipe horizontally to view the full year
      </p>

    </section>
  );
}