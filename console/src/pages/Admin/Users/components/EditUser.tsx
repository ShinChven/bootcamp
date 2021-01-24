import React, {useState} from "react";
import {Button, Col, Drawer, Form, Input, message, Row, Select} from "antd";
import type {User} from "@/services/authentication";
import {RouteContext} from "@ant-design/pro-layout";
import {modalFormItemLayout as formItemLayout} from "@/components/common-layout";
import {EyeInvisibleOutlined, EyeTwoTone} from "@ant-design/icons";
import {RuleObject} from "antd/lib/form";
import {usersService} from "@/services/client";


export type UpdateUserInfoProps = {
  visible: boolean
  onOk: { (): void }
  onClose: { (): void }
  user?: User;
}

const EditUser: React.FC<UpdateUserInfoProps> = ({visible, onOk, onClose, user}) => {

  const [loading, setLoading] = useState<boolean>(false);

  const validateEmail = (rule: RuleObject, email: string): void | Promise<void> => {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      const users = await usersService.find({query: {email}});
      if (users.data.length > 0 && users.data[0].id !== user?.id) {
        // eslint-disable-next-line prefer-promise-reject-errors
        await reject('The email address exists')
      } else {
        await resolve()
      }
    });
  }

  const onFinish = async (values: Record<string, any>) => {
    setLoading(true)
    try {
      const {username, name, phoneNumber, email, password, access} = values;
      let result
      if (user && user.id && user.id > 0) {
        result = await usersService.patch(user.id, {username, name, phoneNumber, email, access});
      } else {
        result = await usersService.create({username, name, phoneNumber, email, password, access});
      }
      if (result?.id > 0) {
        message.success('success')
      }
      onOk()
      onClose()
    } catch (e) {
      console.error(e);
      message.error('failed')
    }
    setLoading(false)
  }

  return <RouteContext.Consumer>
    {({isMobile}) => (
      <Drawer
        width={isMobile ? '90%' : '500px'}
        title={user ? 'Update User Info' : 'Create User'} visible={visible} onClose={() => onClose()}>

        <Form onFinish={onFinish}>
          <Form.Item {...formItemLayout} name="email" label="Email"
                     rules={[
                       {required: true, message: 'email address can not be empty'},
                       {max: 50, message: 'The length of email address exceeded limits(50).'},
                       {validator: validateEmail},
                     ]}
                     hasFeedback
                     initialValue={user?.email}
          >
            <Input type="text" placeholder="Input email address"/>
          </Form.Item>
          <Form.Item initialValue={user?.access || 'user'} label={'Access'} name={'access'}>
            <Select>
              <Select.Option value={'admin'}>admin</Select.Option>
              <Select.Option value={'user'}>user</Select.Option>
            </Select>
          </Form.Item>

          {!user &&
          (<Form.Item name="password" {...formItemLayout} label="Password" rules={[
            {
              required: true,
              message: 'Password is required'
            },
            {
              pattern: new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[^]{8,20}$/, "gm"),
              message: 'Length between 8 and 20, at least 1 upper case character, 1 lower case character and 1 number.'
            }
          ]}
                      hasFeedback
          >
            <Input.Password
              placeholder="请输入密码"
              iconRender={passWordVisible => (passWordVisible ? <EyeTwoTone/> : <EyeInvisibleOutlined/>)}
            />
          </Form.Item>)}
          <Row gutter={12}>
            <Col span={12}><Button style={{width: '100%'}} onClick={() => onClose()}>Cancel</Button></Col>
            <Col span={12}><Button type={"primary"} style={{width: '100%'}} loading={loading}
                                   htmlType={"submit"}>Submit</Button>
            </Col>
          </Row>
        </Form>


      </Drawer>
    )}
  </RouteContext.Consumer>
}

export default EditUser;
