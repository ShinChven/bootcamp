import React, {useState} from "react";
import {Button, Col, Drawer, Form, Input, message, Row} from "antd";
import {modalFormItemLayout as formItemLayout} from "@/components/common-layout";
import {EyeInvisibleOutlined, EyeTwoTone} from "@ant-design/icons";
import type {User} from "@/services/authentication";
import {usersService} from "@/services/client";
import {RouteContext} from "@ant-design/pro-layout";


export type SetPasswordProps = {
  visible: boolean
  onOk: { (): void }
  onClose: { (): void }
  user?: User;
}

const SetPassword: React.FC<SetPasswordProps> = ({user, onClose, onOk, visible}) => {
  const [loading, setLoading] = useState<boolean>(false);

  return <RouteContext.Consumer>
    {({isMobile}) => (
      <Drawer title="Set Password"
              onClose={() => onClose()}
              visible={visible}
              width={isMobile ? '90%' : '500px'}
      >
        {user && user.id! > 0 && (
          <Form onFinish={async ({password}) => {
            if (user && user.id && user.id > 0) {
              setLoading(true)
              try {
                const result = await usersService.patch(user.id, {password});
                if (result.id === user.id) {
                  onOk();
                  onClose();
                  message.success('Setting password success');
                } else {
                  message.error('failed to set password');
                }
              } catch (e) {
                console.error(e)
                message.error('failed to set password')
              }
              setLoading(false)
            }
          }}>
            <Form.Item {...formItemLayout} name="email" label="User">
              <Input hidden disabled type="text" defaultValue={user.email}/>
              {user.email}
            </Form.Item>
            <Form.Item name="password" {...formItemLayout} label="Password" rules={[
              {
                required: true,
                message: 'Password can not be empty'
              },
              {
                pattern: new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[^]{8,20}$/, "gm"),
                message: 'Length between 8 and 20, at least 1 upper case character, 1 lower case character and 1 number.'
              }
            ]}
                       hasFeedback
            >
              <Input.Password
                placeholder="Input password..."
                iconRender={passWordVisible => (passWordVisible ? <EyeTwoTone/> : <EyeInvisibleOutlined/>)}
              />
            </Form.Item>
            <Row gutter={12}>
              <Col span={12}><Button style={{width: '100%'}} onClick={() => onClose()}>Cancel</Button></Col>
              <Col span={12}><Button type={"primary"} style={{width: '100%'}} loading={loading}
                                     htmlType={"submit"}>Submit</Button>
              </Col>
            </Row>
          </Form>
        )}
      </Drawer>
    )}
  </RouteContext.Consumer>;
}

export default SetPassword
