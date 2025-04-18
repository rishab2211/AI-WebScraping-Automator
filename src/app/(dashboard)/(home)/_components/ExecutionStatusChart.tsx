"use client";
import { GetWorkflowExecutionStats } from "@/actions/analytics/getWorkflowExecutionStats";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ChartBar } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

type ChartData = Awaited<ReturnType<typeof GetWorkflowExecutionStats>>;

const chartConfig = {
  success: {
    label: "Success",
    color: "#008000", // Dark Green
  },
  failed: {
    label: "Failed",
    color: "#FF0000", // Red
  },
} satisfies ChartConfig;

type Props = {
  data: ChartData;
};

const ExecutionStatusChart = ({ data }: Props) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <ChartBar className="w-6 h-6 text-primary" />
          Workflow execution Status
        </CardTitle>
        <CardDescription>
          Daily number of successful and failed workflows executions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="max-h-[200px] w-full">
          <AreaChart
            data={data}
            height={200}
            accessibilityLayer
            margin={{ top: 20 }}
          >
            <CartesianGrid />
            <XAxis
              dataKey={"date"}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={30}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartLegend content={<ChartLegendContent />} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="natural"
              dataKey="success"
              fillOpacity={0.6}
              fill={chartConfig.success.color}
              strokeWidth={2}
              stackId={"a"}
            />
            <Area
              type="natural"
              dataKey="failed"
              fillOpacity={0.6}
              fill={chartConfig.failed.color}
              strokeWidth={2}
              stackId={"a"}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default ExecutionStatusChart;
