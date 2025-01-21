import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useReactFlow } from "@xyflow/react";
import React from "react";

const NodeCard = ({
  children,
  nodeId,
  isSelected,
}: {
  nodeId: string;
  children: React.ReactNode;
  isSelected: boolean;
}) => {
  const { getNode, setCenter } = useReactFlow();

  const positionNode = () => {
    const node = getNode(nodeId);
    if (!node) return;

    const { position, measured } = node;
    if (!position || !measured) return;

    const { width, height } = measured;
    const x = position.x + width! / 2;
    const y = position.y + height! / 2;

    if (!x || !y) return;

    setCenter(x, y, {
      zoom: 1,
      duration: 500,
    });
  };

  return (
    <div
      onDoubleClick={positionNode}
      className={cn(
        "rounded  cursor-pointer bg-background border-2 border-separate w-fit text-smgap-1 flex flex-col ",
        isSelected && "border-primary"
      )}
    >
      {children}
      <Separator/>
    </div>
  );
};

export default NodeCard;
