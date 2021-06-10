import React, { useContext, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { Descriptions, Spin, Typography } from "antd";

import libLink from "@clusterio/lib/link";

import ControlContext from "./ControlContext";
import PageLayout from "./PageLayout";
import LogConsole from "./LogConsole";
import StartStopInstanceButton from "./StartStopInstanceButton";
import DataTable from "./data-table";
import { useSlave } from "../model/slave";

const { Title, Paragraph } = Typography;


export default function SlaveViewPage(props) {
	let params = useParams();
	let slaveId = Number(params.id);

	let history = useHistory();

	let control = useContext(ControlContext);
	let [slave] = useSlave(slaveId);

	let [exportingData, setExportingData] = useState(false);

	async function listInstances() {
		let result = await libLink.messages.listInstances.send(control);
		return result["list"]
			.filter(instance => instance.assigned_slave === slaveId)
			.map(item => ({
				key: item["id"],
				"Name": item["name"],
				"Status": item["status"],
			}));
	}

	let nav = [{ name: "Slaves", path: "/slaves" }, { name: slave.name || "Unknown" }];
	if (slave.loading) {
		return <PageLayout nav={nav}><Spin size="large" /></PageLayout>;
	}

	if (slave.missing) {
		return <PageLayout nav={nav}>
			<h2>Slave not found</h2>
			<p>Slave with id {slaveId} was not found on the master server.</p>
		</PageLayout>;
	}

	return <PageLayout nav={nav}>
		<Descriptions
			bordered
			size="small"
			title={slave["name"]}
		>
			<Descriptions.Item label="Connected">{slave["connected"] ? "Yes" : "No"}</Descriptions.Item>
		</Descriptions>

		<Title level={5} style={{ marginTop: 16 }}>Instances</Title>
		<DataTable
			DataFunction={listInstances}
			TableProps={{
				onRow: (record) => ({
					onClick: () => {
						history.push(`/instances/${record.key}/view`);
					},
				}),
			}}
			columns={[{
				dataIndex: "Name",
				title: "Name",
			}, {
				dataIndex: "Status",
				title: "Status",
			}, {
				dataIndex: "actions",
				title: "Actions",
				render: (_, record) => {
					console.log(record);
					return <StartStopInstanceButton instanceId={record.key} />;
				},
			}]}
		/>

		<Title level={5} style={{ marginTop: 16 }}>Logs</Title>
		<LogConsole slaveIds={[slaveId]} />
	</PageLayout>;
}
