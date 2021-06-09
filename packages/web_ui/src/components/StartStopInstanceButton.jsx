import React, { useContext, useState } from "react";
import { Button } from "antd";

import libLink from "@clusterio/lib/link";

import ControlContext from "./ControlContext";
import { notifyErrorHandler } from "../util/notify";
import { useInstance } from "../model/instance";

/**
 * Start/stopp instance button. 
 * @param {Object} props Requires either instanceId or instance
 * @param {Number?} props.instanceId - Instance ID number
 * @param {JSX.Element?} props.instance - Instance component from model/instance/useInstance
 * @returns <Button />
 */
export default function StartStopInstanceButton(props) {
	let control = useContext(ControlContext);
	let [switching, setSwitching] = useState(false);
	let instance = props.instance
	if (!instance) {
		[instance] = useInstance(props.instanceId);
	}

	function onClick() {
		setSwitching(true);
		let action;
		if (instance["status"] === "stopped") {
			action = libLink.messages.startInstance.send(
				control, { instance_id: instance["id"], save: null }
			).catch(
				notifyErrorHandler("Error starting instance")
			);

		} else if (["starting", "running"].includes(instance["status"])) {
			action = libLink.messages.stopInstance.send(
				control, { instance_id: instance["id"] }
			).catch(
				notifyErrorHandler("Error stopping instance")
			);

		} else {
			setSwitching(false);
			return;
		}

		action.finally(() => {
			setSwitching(false);
			if (props.onFinish) {
				props.onFinish();
			}
		});
	}

	return <Button
		{...(props.buttonProps || {})}
		loading={switching}
		type="primary"
		disabled={!["starting", "running", "stopped"].includes(instance["status"])}
		onClick={onClick}
	>
		{instance["status"] === "stopped" ? "Start" : "Stop"}
	</Button>;
}


