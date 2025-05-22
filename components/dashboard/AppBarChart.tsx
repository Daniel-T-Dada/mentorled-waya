'use client'


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { useState } from "react";
import chartData from "@/mockdata/mockbarchart.json"



const chartConfig = {
    allowanceGiven: { label: "Allowance Given", color: "#7DE2D1" },
    allowanceSpent: { label: "Allowance Spent", color: "#7D238E" },
} satisfies ChartConfig;


// const chartData2 = [
//     { browser: "chrome", visitors: 187, fill: "var(--color-chrome)" },
//     { browser: "safari", visitors: 200, fill: "var(--color-safari)" },
//     { browser: "firefox", visitors: 275, fill: "var(--color-firefox)" },
//     { browser: "edge", visitors: 173, fill: "var(--color-edge)" },
//     { browser: "other", visitors: 90, fill: "var(--color-other)" },
// ]

// const chartConfig2 = {
//     visitors: {
//         label: "Visitors",
//     },
//     chrome: {
//         label: "Chrome",
//         color: "hsl(var(--chart-1))",
//     },
//     safari: {
//         label: "Safari",
//         color: "hsl(var(--chart-2))",
//     },
//     firefox: {
//         label: "Firefox",
//         color: "hsl(var(--chart-3))",
//     },
//     edge: {
//         label: "Edge",
//         color: "hsl(var(--chart-4))",
//     },
//     other: {
//         label: "Other",
//         color: "hsl(var(--chart-5))",
//     }
// } satisfies ChartConfig

const AppBarChart = () => {
    const [range, setRange] = useState("7");
    return (
        <div className="lg:col-span-2 rounded-lg shadow-md">
            <Card >
                <CardHeader>
                    <CardTitle>Allowance Breakdown</CardTitle>
                    <CardDescription>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex gap-4 text-xs">
                                <div className="flex items-center gap-1">
                                    <span className="inline-block w-3 h-3 rounded bg-[#7DE2D1]" /> Allowance Given
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="inline-block w-3 h-3 rounded bg-[#7D238E]" /> Allowance Spent
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Select value={range} onValueChange={setRange}>
                                    <SelectTrigger className="w-32 h-8 text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="7">Last 7 days</SelectItem>
                                        <SelectItem value="30">Last 30 days</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer>
                        <ChartContainer config={chartConfig}>
                            <BarChart
                                accessibilityLayer
                                data={chartData}
                                margin={{
                                    top: 20,
                                    right: 30,
                                    left: 20,
                                    bottom: 20
                                }}
                            >
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tickLine={false}
                                    tickMargin={10}
                                    axisLine={false}
                                    tick={{ fontSize: 12 }}
                                    tickFormatter={(value) => {
                                        const date = new Date(value);
                                        return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
                                    }}
                                />
                                <YAxis

                                    tickLine={false}
                                    tickMargin={10}
                                    axisLine={false}
                                    tickFormatter={(value) => `₦${value}k`}

                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent hideLabel />}
                                />
                                <Bar
                                    dataKey="allowanceGiven"
                                    radius={[6, 6, 0, 0]}
                                    fill={chartConfig.allowanceGiven.color}
                                />
                                <Bar
                                    dataKey="allowanceSpent"
                                    radius={[6, 6, 0, 0]}
                                    fill={chartConfig.allowanceSpent.color}
                                />
                            </BarChart>
                        </ChartContainer>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    )
}
export default AppBarChart