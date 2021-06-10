import React, { useContext, useState } from "react";
import { Table, Button, Popover, Space } from "antd";
import PlusOutlined from "@ant-design/icons/PlusOutlined";
import { useHistory } from "react-router-dom";

import ControlContext from "./ControlContext";
import PageLayout from "./PageLayout";
import { useSlaveList } from "../model/slave";
import SlaveConfigCreateModal from "./SlaveConfigCreateModal";
import { QuestionCircleOutlined } from "@ant-design/icons";
import Paragraph from "antd/lib/typography/Paragraph";


export default function SlavesPage() {
	let control = useContext(ControlContext);
	let [slaveList] = useSlaveList();
	let history = useHistory();
	let [showModal, setShowModal] = useState(false);

	return <PageLayout nav={[{ name: "Slaves" }]}>
		<h2>Slaves</h2>
		<Table
			columns={[
				{
					title: "Name",
					dataIndex: "name",
				},
				{
					title: "Agent",
					dataIndex: "agent",
				},
				{
					title: "Version",
					dataIndex: "version",
				},
				{
					title: "Connected",
					key: "connected",
					render: slave => slave["connected"] && "Yes",
				},
			]}
			dataSource={slaveList}
			rowKey={slave => slave["id"]}
			pagination={false}
			onRow={(record) => ({
				onClick: () => {
					history.push(`/slaves/${record.id}/view`);
				},
			})}
		/>
		<Button type="primary" onClick={() => setShowModal(true)}>
			<PlusOutlined />Add new slave
		</Button>
		<Popover
			trigger="hover"
			content={
				<Space
					direction="vertical"
					style={{
						maxWidth: 700,
					}}
				>
					<Paragraph>
						Slaves are daemons running on physical servers. They have the task of orchestrating instances which host factorio servers. To join a cluster as a server hoster, you need the "Create slave config" and "Generate slave token" permission (or get your token from the cluster administrator). After filling out the form on this page you get a config-slave.json file.
					</Paragraph>
					<Paragraph>
						Clusterio depends on nodejs. Download the latest version from <a href="https://nodejs.org">nodejs.org</a> and install it.
					</Paragraph>
					<Paragraph>
						To create your slave, create a new folder and shift + right click to open a cmd prompt. Type in "npm init -y", then "npm install @clusterio/slave". Copy in your config-slave.json file. Download the standalone version of factorio from <a href="https://factorio.com">factorio.com</a> and unzip it in the folder. We expect to find factorio.exe at your-folder-name/factorio/bin/x64/factorio.exe
					</Paragraph>
					<Paragraph>
						To run your slave, simply type "npx clusterioslave run". It should now show in the web interface and be ready for administration.
					</Paragraph>
				</Space>
			}
		>
			<Button>
				<QuestionCircleOutlined />
			</Button>
		</Popover >
		<SlaveConfigCreateModal
			ShowModal={showModal}
			SetShowModal={setShowModal}
			Control={control}
		/>
	</PageLayout >;
};
