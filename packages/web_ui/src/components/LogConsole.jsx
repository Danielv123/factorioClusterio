import React, { useEffect, useContext, useRef, useState } from "react";
import { Checkbox, Typography } from "antd";

import libLink from "@clusterio/lib/link";

import ControlContext from "./ControlContext";

const { Paragraph } = Typography;


function formatParsedOutput(parsed, key) {
	let time = "";
	if (parsed.format === "seconds") {
		time = <span className="factorio-time">{parsed.time.padStart(8)} </span>;
	} else if (parsed.format === "date") {
		time = <span className="factorio-time">{parsed.time} </span>;
	}

	let info = "";
	if (parsed.type === "log") {
		let level = parsed.level;
		if (level === "Script") {
			level = <span className="factorio-script">{level}</span>;
		} else if (level === "Verbose") {
			level = <span className="factorio-verbose">{level}</span>;
		} else if (level === "Info") {
			level = <span className="factorio-info">{level}</span>;
		} else if (parsed.level === "Warning") {
			level = <span className="factorio-warning">{level}</span>;
		} else if (parsed.level === "Error") {
			level = <span className="factorio-error">{level}</span>;
		}

		info = <>{level} <span className="factorio-filename">{parsed.file}: </span></>;

	} else if (parsed.type === "action") {
		info = <>[<span className="factorio-action">{parsed.action}</span>] </>;
	}

	return <span key={key}>{time}{info}{parsed.message}<br /></span>;
}

function formatLog(info, key) {
	if (info.level === "server" && info.parsed) {
		return {
			info,
			component: formatParsedOutput(info.parsed, key),
		};
	}
	let level = <span className={`log-${info.level}`}>{info.level}</span>;
	return {
		info,
		component: <span key={key}>[{level}] {info.message}<br /></span>,
	}
}

export default function LogConsole(props) {
	let control = useContext(ControlContext);
	let anchor = useRef();
	let [pastLines, setPastLines] = useState([<span key={0}>{"Loading past entries..."}<br /></span>]);
	let [lines, setLines] = useState([]);
	let [filterInstanceLogs, setFilterInstanceLogs] = useState(!!props.slaveIds)

	useEffect(() => {
		// Scroll view to the anchor so it sticks to the bottom
		let parent = anchor.current.parentElement;
		parent.scrollTop = parent.scrollHeight - parent.clientHeight;

		libLink.messages.queryLog.send(control, {
			all: false,
			master: false,
			slave_ids: props.slaveIds || [],
			instance_ids: props.instanceIds || [],
			max_level: null,
		}).then(result => {
			setPastLines(result.log.slice(-400).map((info, index) => formatLog(info, index)));
		}).catch(err => {
			setPastLines([<span key={0}>{`Error loading log: ${err.message}`}<br /></span>]);
		});

		function logHandler(info) {
			setLines(currentLines => currentLines.concat(
				[formatLog(info, currentLines.length)]
			));
		}

		props.instanceIds?.forEach(id => control.onInstanceLog(id, logHandler));
		props.slaveIds?.forEach(id => control.onSlaveLog(id, logHandler));
		return () => {
			props.instanceIds?.forEach(id => control.offInstanceLog(id, logHandler));
			props.slaveIds?.forEach(id => control.offSlaveLog(id, logHandler));
		};
	}, [props.id]);

	return <>
		<Paragraph code className="instance-console">
			{pastLines
				.filter(line => filterInstanceLogs ? !line.info?.instance_id : true)
				.map(line => line.component)
			}
			{lines
				.filter(line => filterInstanceLogs ? !line.info?.instance_id : true)
				.map(line => line.component)
			}
			<div className="scroll-anchor" ref={anchor} />
		</Paragraph>
		{props.slaveIds && <><Checkbox
			checked={filterInstanceLogs}
			onChange={e => setFilterInstanceLogs(e.target.checked)}
		/> Filter out instance logs</>}
	</>;
}

