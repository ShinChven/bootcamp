import React from "react";
import {User} from "@/services/authentication";
import {FormInstance, RuleObject} from "antd/lib/form";
import {usersService} from "@/services/client";
import {Form, Input, message, Modal} from "antd";
import {modalFormItemLayout as formItemLayout} from "@/components/common-layout";
import {EyeInvisibleOutlined, EyeTwoTone} from "@ant-design/icons/lib";

interface EditUserInfoModalProps {
  visible: boolean
  user?: User
  onOk: Function
  onClose: Function
}

export default class EditUserInfoModal extends React.PureComponent<EditUserInfoModalProps> {

  formRef = React.createRef<FormInstance>()

  static defaultProps = {
    visible: false,
    onOk: () => {
    },
    onClose: () => {
    }
  }

  handleOk = async () => {
    try {
      const form = this.formRef.current;
      form?.submit()
      if (form) {
        const values = await form.validateFields();
        const {username, name, phoneNumber, email, password} = values;
        const {user} = this.props;
        if (user && user.id && user.id > 0) {
          await usersService.patch(user.id, {username, name, phoneNumber, email});
        } else {
          await usersService.create({username, name, phoneNumber, email, password});
        }
        this.props.onOk();
        this.props.onClose();
        form.resetFields();
      }
    } catch (e) {
      message.error('操作失败');
    }
  }

  handleCancel = () => {
    this.props.onClose();
  }

  validateEmail = (rule: RuleObject, email: string): void | Promise<void> => {
    const {user} = this.props;
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

  render() {
    const {visible, user} = this.props;
    return <Modal visible={visible}
                  title={user ? 'Edit User' : 'Create User'}
                  onOk={this.handleOk}
                  onCancel={this.handleCancel}

    >
      <Form
        ref={this.formRef}>
        <Form.Item {...formItemLayout} name="email" label="Email"
                   rules={[
                     {required: true, message: 'email address can not be empty'},
                     {max: 50, message: 'The length of email address exceeded limits(50).'},
                     {validator: this.validateEmail},
                   ]}
                   hasFeedback
                   initialValue={user?.email}
        >
          <Input type="text" placeholder="Input email address"/>
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

      </Form>
    </Modal>;
  }
}
