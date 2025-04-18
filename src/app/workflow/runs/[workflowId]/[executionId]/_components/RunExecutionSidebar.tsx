"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  CircleCheck,
  CircleDashedIcon,
  CircleEllipsis,
  CirclePlay,
  CoinsIcon,
  Loader2Icon,
  LucideIcon,
  SquarePen,
  TimerIcon,
  WorkflowIcon,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  ExecutionPhaseStatus,
  WorkflowExecutionStatus,
} from "@/app/types/Workflows";
import { GetWorkflowExecutionWithPhases } from "@/actions/workflows/getWorkflowExecutionWithPhases";
import { formatDistanceToNow } from "date-fns";
import { DatesToDurationString, GetPhasesTotalCost } from "@/lib/helper";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PhaseExecutionStatusBadge from "./PhaseExecutionStatusBadge";
import CreateCountupWrapper from "@/components/CreateCountupWrapper";

type ExecutionData = Awaited<ReturnType<typeof GetWorkflowExecutionWithPhases>>;

export function RunExecutionSidebar({
  initialData,
}: {
  initialData: ExecutionData;
}) {
  const query = useQuery({
    queryKey: ["execution", initialData?.id],
    initialData,
    queryFn: () => GetWorkflowExecutionWithPhases(initialData!.id),
    refetchInterval: (q) =>
      q.state.data?.status === WorkflowExecutionStatus.RUNNING ? 1000 : false,
  });

  const isRunning = query?.data?.status === WorkflowExecutionStatus.RUNNING;

  const duration = DatesToDurationString(
    query?.data?.completedAt,
    query?.data?.startedAt
  );

  const creditsConsumed = GetPhasesTotalCost(query?.data?.phases || []);

  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedPhase = searchParams.get("phase") || null;

  const handlePhaseSelect = (phaseId: string) => {
    const params = new URLSearchParams(searchParams);
    // If the same phase is already selected, remove it
    if (selectedPhase === phaseId) {
      params.delete("phase");
    } else {
      // Otherwise, set the new phase
      params.set("phase", phaseId);
    }
    router.push(`?${params.toString()}`);
  };

  return (
    <Sidebar className=" top-[60px] h-screen p-1">
      <SidebarContent className="bg-background h-full no-scrollbar">
        <SidebarMenuItem className="list-none h-full ">
          <ExecutionLabel
            label={"STATUS"}
            value={query?.data?.status}
            icon={CircleDashedIcon}
          />
          <ExecutionLabel
            label={"STARTED AT"}
            value={
              query?.data?.startedAt
                ? formatDistanceToNow(new Date(query.data?.startedAt), {
                    addSuffix: true,
                  })
                : "-"
            }
            icon={CirclePlay}
          />
          <ExecutionLabel
            label={"CREATED AT"}
            value={
              query?.data?.startedAt
                ? formatDistanceToNow(new Date(query.data?.startedAt), {
                    addSuffix: true,
                  })
                : "-"
            }
            icon={SquarePen}
          />
          <ExecutionLabel
            label={"COMPLETED AT"}
            value={
              query?.data?.completedAt
                ? formatDistanceToNow(new Date(query.data?.createdAt), {
                    addSuffix: true,
                  })
                : "---"
            }
            icon={CircleCheck}
          />
          <ExecutionLabel
            label={"DURATION"}
            value={
              duration ? (
                duration
              ) : (
                <Loader2Icon
                  className="animate-spin text-yellow-500"
                  size={18}
                />
              )
            }
            icon={TimerIcon}
          />
          <ExecutionLabel
            label={"CREDITS CONSUMED"}
            value={<CreateCountupWrapper value={creditsConsumed} />}
            icon={CoinsIcon}
          />

          <div className="flex justify-center items-center gap-1 border-t border-b ">
            <WorkflowIcon size={16} />
            PHASE
          </div>

          <section className=" pb-20">
            {query.data?.phases.map((phase, index) => (
              <SidebarMenuButton
                key={phase.id}
                className="my-1 flex justify-between"
                onClick={() => {
                  if (isRunning) return;
                  handlePhaseSelect(phase.id);
                }}
                variant={selectedPhase === phase.id ? "secondary" : "default"}
              >
                <div className="flex gap-1">
                  <Badge variant={"outline"}>{index + 1}</Badge>
                  {phase.name}
                </div>

                <PhaseExecutionStatusBadge
                  status={phase.status as ExecutionPhaseStatus}
                />
              </SidebarMenuButton>
            ))}
          </section>
        </SidebarMenuItem>
      </SidebarContent>
    </Sidebar>
  );
}

function ExecutionLabel({
  icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: React.ReactNode;
  value: React.ReactNode;
}) {
  const Icon = icon;

  return (
    <SidebarMenuButton className="flex justify-between p-2 my-0.5">
      <div className="flex items-center gap-1">
        <Icon size={15} />
        <span>{label}</span>
      </div>
      <div>{value}</div>
    </SidebarMenuButton>
  );
}
