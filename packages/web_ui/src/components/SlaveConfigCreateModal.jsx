import React from "react"
import { Checkbox, Input, Form, Modal, Button } from "antd"

import libLink from "@clusterio/lib/link";

export default class SlaveConfigCreateModal extends React.Component {
    constructor() {
        super()
    }
    hideModal() {
        this.props.SetShowModal(false)
    }
    async onFinish(values) {
        let response = await libLink.messages.createSlaveConfig.send(this.props.Control, {
            id: null,
            name: values.name,
            generate_token: !!values.generate_token,
        })
        downloadTextFile(JSON.stringify(response.serialized_config, null, 4))

        this.hideModal()
    }
    render() {
        if (!this.props.ShowModal) return <></>

        return <Modal
            visible={this.props.ShowModal}
            onCancel={this.hideModal.bind(this)}
            footer={null}
            title={
                <h2>Create slave configuration</h2>
            }
        >
            <Form
                labelCol={{
                    span: 6,
                }}
                wrapperCol={{
                    span: 12,
                }}
                layout="horizontal"
                onFinish={this.onFinish.bind(this)}
            >
                <Form.Item key="name" label="Slave name" name="name">
                    <Input placeholder="New slave" />
                </Form.Item>
                <Form.Item key="generate_token" label="Generate token" name="generate_token" valuePropName="checked">
                    <Checkbox defaultChecked />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Create and download config
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    }
}
function downloadTextFile(text) {
	const element = document.createElement("a")
	const file = new Blob([text], { type: "text/plain" })
	element.href = URL.createObjectURL(file)
	element.download = "config-slave.json"
	document.body.appendChild(element)
	element.click()
}
