import { CustomNode, CustomNodeMissingInputs } from "@/app/types/appNode";
import { WorkflowExecutionPlan, WorkflowExecutionPlanPhase } from "@/app/types/Workflows";
import { Edge } from "@xyflow/react";
import { TaskRegistry } from "./task/Registry";

export enum FlowToExecutionPlanValidationError  {
    "NO_ENTRY_POINT",
    "INVALID_INPUTS",
}

type FlowToExecutionPlan = {
    executionPlan?: WorkflowExecutionPlan;
    error?: {
        type : FlowToExecutionPlanValidationError;
        invalidElements?: CustomNodeMissingInputs[];
    }
}

export function FlowToExecutionPlan(nodes: CustomNode[], edges: Edge[]): FlowToExecutionPlan {

    const entryPoint = nodes.find(node => TaskRegistry[node.data.type].isEntryPoint);

    if (!entryPoint) {
        return {
            error : {
                type : FlowToExecutionPlanValidationError.NO_ENTRY_POINT
            }
        }
    }

    const inputsWithErrors : CustomNodeMissingInputs[] = [];

    const planned = new Set<string>();

    const invalidInputs = getInvalidInputs(entryPoint,edges,planned);
    if(invalidInputs.length>0){
        inputsWithErrors.push({
            nodeId : entryPoint.id,
            inputs : invalidInputs
        })
    }

    const executionPlan: WorkflowExecutionPlan = [{
        phase: 1,
        nodes: [entryPoint],
    }];

    planned.add(entryPoint.id)

    for (let phase = 2; phase <= nodes.length && planned.size < nodes.length; phase++) {

        const nextPhase: WorkflowExecutionPlanPhase = { phase, nodes: [] };
        for (const currentNode of nodes) {
            if (planned.has(currentNode.id)) {
                // Node already put in the execution plan
                continue;
            }

            const invalidInputs = getInvalidInputs(currentNode, edges, planned);
            if (invalidInputs.length > 0) {
                const incomers = getIncomers(currentNode, nodes, edges);
                if (incomers.every(incomer => planned.has(incomer.id))) {
                    // if all incoming/edges are planned and there are still invalid inputs
                    // this means that this particular node has an invalid input
                    // which means that the workflow is invalid
                    console.error("invalid inputs", currentNode.id, invalidInputs);
                    inputsWithErrors.push({
                        nodeId : currentNode.id,
                        inputs : invalidInputs
                    })
                } else {
                    // let's skip this node for now
                    continue;
                }
            }

            nextPhase.nodes.push(currentNode);
            // planned.add(currentNode.id);
        }
        for (const node of nextPhase.nodes) {
            planned.add(node.id);
        }
        executionPlan.push(nextPhase);
    }

    if(inputsWithErrors.length>0){
        return {
            error : {
                type : FlowToExecutionPlanValidationError.INVALID_INPUTS,
                invalidElements : inputsWithErrors
            }
        }
    }

    return { executionPlan };
}


function getInvalidInputs(node: CustomNode, edges: Edge[], planned: Set<string>) {
    const invalidInputs = [];
    const inputs = TaskRegistry[node.data.type].inputs;
    for (const input of inputs) {

        const inputValue = node.data.inputs[input.name];
        const inputValueProvided = inputValue?.length > 0;

        if (inputValueProvided) {
            //this input is fine, so we can move on
            continue;
        }

        //If a value is not provided by the user then we need to check
        //If there is an output linked to the current input

        const incomingEdges = edges.filter((edge) => edge.target === node.id);

        const inputLinkedToOutput = incomingEdges.find(
            (edge) => edge.targetHandle === input.name
        );

        const requiredInputProvidedByVisitedOutput =
            input.required &&
            inputLinkedToOutput &&
            planned.has(inputLinkedToOutput.source);

        if (requiredInputProvidedByVisitedOutput) {
            // the inputs is required and we have a valid value for it
            // provided by a task that is already planned

            continue;
        } else if (!input.required) {
            // if the input is not required but there is an output linked to it
            // then we need to be sure that the output is already planned

            if (!inputLinkedToOutput) {
                continue;
            }
            if (inputLinkedToOutput && planned.has(inputLinkedToOutput.source)) {
                // the output is providing a value to the input: so the input is fine
                continue;
            }

            
        }
        invalidInputs.push(input.name);


    }
    return invalidInputs;
}


function getIncomers(node : CustomNode, nodes : CustomNode[], edges : Edge[]){
    if(!node.id){
        return [];
    }

    const incomersIds = new Set();

    edges.forEach((edge)=>{
        if(edge.target===node.id){
            incomersIds.add(edge.source);
        }
    })

    return nodes.filter(n=> incomersIds.has(n.id))

}