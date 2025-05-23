'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { PieChart, Pie, Cell, Label } from "recharts";
import { useState, useMemo } from "react";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import { mockDataService } from '@/lib/services/mockDataService';

const chartConfig = {
    value: {
        label: "Chores",
    },
    Completed: {
        label: "Completed",
        color: "#7DE2D1",
    },
    Pending: {
        label: "Pending",
        color: "#FFB800",
    },
} satisfies ChartConfig;

const AppPieChart = () => {
    const [range, setRange] = useState("7days");


    const processedData = useMemo(() => {
        console.log('--- Pie Chart Data Processing ---');
        console.log('Selected range:', range);

        // Get chores from mockDataService
        const chores = mockDataService.getChoresByDateRange(range);
        console.log('Filtered chores:', chores);


        // const today = new Date();
        // today.setHours(0, 0, 0, 0);

        // if (range === "7") {
        //     const sevenDaysAgo = new Date(today);
        //     sevenDaysAgo.setDate(today.getDate() - 7);
        //     console.log('Filtering for last 7 days, comparison date:', sevenDaysAgo.toISOString());
        //     filteredChores = mockChores.filter(chore => {
        //         const choreDate = new Date(chore.createdAt);
        //         choreDate.setHours(0, 0, 0, 0);
        //         const isAfter = choreDate >= sevenDaysAgo;
        //         console.log(`Chore ${chore.id} created at ${chore.createdAt} (normalized: ${choreDate.toISOString()}) >= $
        //         {sevenDaysAgo.toISOString()}? ${isAfter}`);
        //         return isAfter;
        //     });
        // } else if (range === "30") {
        //     const thirtyDaysAgo = new Date(today);
        //     thirtyDaysAgo.setDate(today.getDate() - 30);
        //     console.log('Filtering for last 30 days, comparison date:', thirtyDaysAgo.toISOString());
        //     filteredChores = mockChores.filter(chore => {
        //         const choreDate = new Date(chore.createdAt);
        //         choreDate.setHours(0, 0, 0, 0);
        //         const isAfter = choreDate >= thirtyDaysAgo;
        //         console.log(`Chore ${chore.id} created at ${chore.createdAt} (normalized: ${choreDate.toISOString()}) >= $
        //         {thirtyDaysAgo.toISOString()}? ${isAfter}`);
        //         return isAfter;
        //     });
        // } else {
        //     console.log('No date range filter applied');
        //     filteredChores = mockChores;
        // }

        // console.log('Filtered chores:', filteredChores);

        // const completedCount = filteredChores.filter(chore => chore.status === "completed").length;
        // const pendingCount = filteredChores.filter(chore => chore.status === "pending").length;

        const completedCount = chores.filter(chore => chore.status === "completed").length;
        const pendingCount = chores.filter(chore => chore.status === "pending").length;

        console.log('Completed count:', completedCount);
        console.log('Pending count:', pendingCount);

        // Data for the pie chart (recharts format)
        const chartData = [
            { name: "Completed", value: completedCount, color: chartConfig.Completed.color },
            { name: "Pending", value: pendingCount, color: chartConfig.Pending.color },
        ];

        console.log('Processed chart data:', chartData);
        console.log('-----------------------------------');

        return chartData;
    }, [range]);

    const totalChores = processedData.reduce((acc, curr) => acc + curr.value, 0);

    return (
        <Card className="">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold">Chore Breakdown</CardTitle>
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
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center">
                    <ChartContainer
                        config={chartConfig}
                        className="mx-auto aspect-square max-h-[200px] w-[200px]"
                    >
                        <PieChart>
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent hideLabel={false} formatter={(value) => [`${value} Chores`, '']} />}
                            />
                            <Pie
                                data={processedData}
                                dataKey="value"
                                nameKey="name"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                startAngle={180}
                                endAngle={-180}
                                stroke="none"
                            >
                                {processedData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}

                                {totalChores > 0 && (
                                    <Label
                                        content={({ viewBox }) => {
                                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                                return (
                                                    <text
                                                        x={viewBox.cx}
                                                        y={viewBox.cy}
                                                        textAnchor="middle"
                                                        dominantBaseline="middle"
                                                        className="fill-foreground text-2xl font-bold"
                                                    >
                                                        {totalChores.toLocaleString()}
                                                    </text>
                                                );
                                            }
                                        }}
                                    />
                                )}
                            </Pie>
                        </PieChart>
                    </ChartContainer>


                    <div className="flex flex-col gap-2 w-full mt-4 text-sm">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-[#7DE2D1]"></div>
                                <span>Completed Chore</span>
                            </div>
                            <span className="font-medium">{processedData.find(d => d.name === 'Completed')?.value ?? 0} Chore</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-[#FFB800]"></div>
                                <span>Pending Chore</span>
                            </div>
                            <span className="font-medium">{processedData.find(d => d.name === 'Pending')?.value ?? 0} Chore</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default AppPieChart; 