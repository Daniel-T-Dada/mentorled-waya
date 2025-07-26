
import { TooltipProps } from 'recharts';

// interface ChartDataPoint {
//     date: string;
//     highest: number;
//     lowest: number;
//     highestName?: string;
//     lowestName?: string;
// }

const CustomBarChartTooltip = ({
    active,
    payload,
    label,
}: TooltipProps<number, string>) => {
    if (active && payload && payload.length > 0) {
        const data = payload[0].payload;
        return (
            <div className="p-2 rounded bg-white shadow text-xs">
                <div><strong>Date:</strong> {label}</div>
                <div>
                    <span style={{ color: "#7DE2D1" }}><strong>Highest Earner:</strong></span>
                    {` ${data.highestName ?? '—'} (${data.highest.toLocaleString()})`}
                </div>
                <div>
                    <span style={{ color: "#7D238E" }}><strong>Lowest Earner:</strong></span>
                    {` ${data.lowestName ?? '—'} (${data.lowest.toLocaleString()})`}
                </div>
            </div>
        );
    }
    return null;
};

export default CustomBarChartTooltip;