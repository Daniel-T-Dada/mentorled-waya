import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import chartData from "@/mockdata/mockbarchart.json"
import { useState } from "react";

const chartConfig = {
    allowanceGiven: { label: "Allowance Given", color: "#7DE2D1" },
    allowanceSpent: { label: "Allowance Spent", color: "#7D238E" },
};

export function AppPieChart() {
    const [range, setRange] = useState("7");

    return (
        <Card className="w-full max-w-2xl rounded-2xl">
            <CardContent className="pt-6 pb-2">
                <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-base font-semibold mb-0">Allowance Breakdown</CardTitle>
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
                <div className="flex items-center gap-6 mb-2 ml-1 text-xs">
                    <div className="flex items-center gap-1">
                        <span className="inline-block w-3 h-3 rounded bg-[#7DE2D1]" /> Allowance Given
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="inline-block w-3 h-3 rounded bg-[#7D238E]" /> Allowance Spent
                    </div>
                </div>
                <div className="h-64 w-full">
                    <ChartContainer config={chartConfig}>
                        <BarChart data={chartData} barGap={16} barCategoryGap={30}>
                            <XAxis 
                            dataKey="date" 
                            axisLine={false} 
                            tickLine={false} 
                            
                            />

                            <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 12 }} 
                            tickFormatter={v => `NGN ${v.toLocaleString()}K`} />

                            <Tooltip 
                            content={<ChartTooltipContent />} 
                            formatter={(value: number) => `NGN ${value.toLocaleString()}K`} />
                            <Bar 
                            dataKey="allowanceGiven" 
                            fill="#7DE2D1" 
                            radius={[6, 6, 0, 0]} />

                            <Bar 
                            dataKey="allowanceSpent" 
                            fill="#7D238E" 
                            radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ChartContainer>
                </div>
            </CardContent>
        </Card>
    );
}

export default AppPieChart; 