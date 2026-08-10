import {
    useMemo,
} from "react";

import type {
    CodeforcesRatingPoint,
} from "../hooks/useCodeforcesDashboard";

interface Props {
    data: CodeforcesRatingPoint[];
}

export default function CodeforcesRatingChart({
    data,
}: Props) {
    const points =
        useMemo(() => {
            return [...data].sort(
                (a, b) =>
                    new Date(a.date).getTime() -
                    new Date(b.date).getTime(),
            );
        }, [data]);

    if (points.length === 0) {
        return (
            <section className="rounded-2xl border bg-white p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900">
                    Rating history
                </h3>

                <p className="mt-3 text-sm text-gray-500">
                    No Codeforces rating history available yet.
                </p>
            </section>
        );
    }

    const width = 900;
    const height = 320;

    const paddingLeft = 55;
    const paddingRight = 25;
    const paddingTop = 25;
    const paddingBottom = 45;

    const chartWidth =
        width -
        paddingLeft -
        paddingRight;

    const chartHeight =
        height -
        paddingTop -
        paddingBottom;

    const ratings =
        points.map(
            (point) => point.rating,
        );

    const minRating =
        Math.floor(
            Math.min(...ratings) / 100,
        ) * 100;

    const maxRating =
        Math.ceil(
            Math.max(...ratings) / 100,
        ) * 100;

    const ratingRange =
        Math.max(
            maxRating - minRating,
            100,
        );

    const getX =
        (index: number) => {
            if (points.length === 1) {
                return (
                    paddingLeft +
                    chartWidth / 2
                );
            }

            return (
                paddingLeft +
                (index /
                    (points.length - 1)) *
                    chartWidth
            );
        };

    const getY =
        (rating: number) => {
            return (
                paddingTop +
                chartHeight -
                ((rating - minRating) /
                    ratingRange) *
                    chartHeight
            );
        };

    const path =
        points
            .map(
                (point, index) => {
                    const x =
                        getX(index);

                    const y =
                        getY(
                            point.rating,
                        );

                    return `${
                        index === 0
                            ? "M"
                            : "L"
                    } ${x} ${y}`;
                },
            )
            .join(" ");

    const gridRatings =
        Array.from(
            {
                length:
                    Math.floor(
                        ratingRange / 100,
                    ) + 1,
            },
            (_, index) =>
                minRating +
                index * 100,
        );

    const firstDate =
        new Date(
            points[0].date,
        ).toLocaleDateString(
            undefined,
            {
                month: "short",
                year: "numeric",
            },
        );

    const lastDate =
        new Date(
            points[
                points.length - 1
            ].date,
        ).toLocaleDateString(
            undefined,
            {
                month: "short",
                year: "numeric",
            },
        );

    const latest =
        points[points.length - 1];

    return (
        <section className="rounded-2xl border bg-white p-6 shadow-sm sm:p-8">

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

                <div>
                    <h3 className="text-xl font-bold text-gray-900">
                        Rating history
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                        Codeforces contest rating over time
                    </p>
                </div>

                <div className="rounded-xl bg-gray-50 px-4 py-3">
                    <p className="text-xs text-gray-500">
                        Current rating
                    </p>

                    <p className="text-2xl font-bold text-gray-900">
                        {latest.rating}
                    </p>
                </div>

            </div>

            <div className="w-full overflow-x-auto">

                <svg
                    viewBox={`0 0 ${width} ${height}`}
                    className="h-auto min-w-[650px] w-full"
                    preserveAspectRatio="none"
                >

                    {/* Grid */}

                    {gridRatings.map(
                        (rating) => {
                            const y =
                                getY(
                                    rating,
                                );

                            return (
                                <g
                                    key={
                                        rating
                                    }
                                >
                                    <line
                                        x1={
                                            paddingLeft
                                        }
                                        y1={
                                            y
                                        }
                                        x2={
                                            width -
                                            paddingRight
                                        }
                                        y2={
                                            y
                                        }
                                        stroke="currentColor"
                                        className="text-gray-100"
                                    />

                                    <text
                                        x={
                                            paddingLeft -
                                            10
                                        }
                                        y={
                                            y +
                                            4
                                        }
                                        textAnchor="end"
                                        className="fill-gray-400 text-[11px]"
                                    >
                                        {
                                            rating
                                        }
                                    </text>
                                </g>
                            );
                        },
                    )}

                    {/* Rating line */}

                    <path
                        d={path}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-black"
                    />

                    {/* Contest points */}

                    {points.map(
                        (
                            point,
                            index,
                        ) => {
                            const x =
                                getX(
                                    index,
                                );

                            const y =
                                getY(
                                    point.rating,
                                );

                            return (
                                <circle
                                    key={`${point.contestId}-${point.date}`}
                                    cx={x}
                                    cy={y}
                                    r="4"
                                    className="fill-black"
                                >
                                    <title>
                                        {
                                            point.contestName
                                        }
                                        {" — "}
                                        {
                                            point.rating
                                        }
                                        {" — "}
                                        {new Date(
                                            point.date,
                                        ).toLocaleDateString()}
                                    </title>
                                </circle>
                            );
                        },
                    )}

                    {/* X axis */}

                    <text
                        x={
                            paddingLeft
                        }
                        y={
                            height -
                            15
                        }
                        className="fill-gray-400 text-[11px]"
                    >
                        {firstDate}
                    </text>

                    <text
                        x={
                            width -
                            paddingRight
                        }
                        y={
                            height -
                            15
                        }
                        textAnchor="end"
                        className="fill-gray-400 text-[11px]"
                    >
                        {lastDate}
                    </text>

                </svg>

            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                <span>
                    {points.length} contests
                </span>

                <span>
                    Latest rank: #{latest.rank}
                </span>
            </div>

        </section>
    );
}