"use client";

import { TaskParam, TaskParamType } from "@/app/types/tasks";
import { Input } from "@/components/ui/input";
import React, { useCallback } from "react";
import StringParam from "./param/StringParam";
import { useReactFlow } from "@xyflow/react";
import { CustomNode } from "@/app/types/appNode";
import BrowserInstanceParam from "./param/BrowserInstanceParam";
import SelectParam from "./param/SelectParam";
import CredentialsParam from "./param/CredentialsParam";

const NodeParamField = ({
  param,
  nodeId,
  disabled,
}: {
  param: TaskParam;
  nodeId: string;
  disabled: boolean;
}) => {
  const { updateNodeData, getNode } = useReactFlow();
  const node = getNode(nodeId) as CustomNode;
  const value = node?.data.inputs?.[param.name] || ""; //providing default null value

  const updateNodeParamValue = useCallback(
    (newValue: string) => {
      updateNodeData(nodeId, {
        inputs: {
          ...node?.data.inputs,
          [param.name]: newValue,
        },
      });
    },
    [nodeId, node?.data.inputs]
  );

  switch (param.type) {
    case TaskParamType.STRING:
      return (
        <StringParam
          param={param}
          value={value}
          updateNodeParamValue={updateNodeParamValue}
          disabled={disabled}
        />
      );

    case TaskParamType.BROWSER_INSTANCE:
      return (
        <BrowserInstanceParam
          param={param}
          value={""}
          updateNodeParamValue={updateNodeParamValue}
        />
      );
    case TaskParamType.SELECT:
      return (
        <SelectParam
          param={param}
          value={value}
          updateNodeParamValue={updateNodeParamValue}
          disabled={disabled}
          
        />
      );
      case TaskParamType.CREDENTIAL:
        return (
          <CredentialsParam
            param={param}
            value={value}
            updateNodeParamValue={updateNodeParamValue}
            disabled={disabled}
            
          />
        );
    default:
      return (
        <div className="w-full">
          <p className="text-xs text-muted-foreground ">Not implemented</p>
        </div>
      );
  }
};

export default NodeParamField;
