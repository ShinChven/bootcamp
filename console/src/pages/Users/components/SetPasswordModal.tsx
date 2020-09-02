import React from "react";
import {Form, Input, message, Modal} from "antd";
import {User} from "@/models/authentication";
import {EyeInvisibleOutlined, EyeTwoTone} from "@ant-design/icons/lib";
import {usersService} from "@/services/client";
import {FormInstance} from 'antd/lib/form';

import {modalFormItemLayout as formItemLayout} from "@/components/common-layout";


class SetPasswordModal extends React.PureComponent<{
  visible: boolean
  user?: User
  onOk: Function
  onClose: Function
}> {

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
        const {password} = values;
        const {user} = this.props;
        if (user && user.id && user.id > 0) {
          await usersService.patch(user.id, {password});
          this.props.onOk();
          this.props.onClose();
        }
      }
    } catch (e) {
      message.error('设置失败');
    }
  }

  handleCancel = () => {
    this.props.onClose();
  }

  render() {
    const {visible, user} = this.props;
    return <Modal visible={visible}
                  title="设置密码"
                  onOk={this.handleOk}
                  onCancel={this.handleCancel}

    >
      {user && (<Form
        ref={this.formRef}>
        <Form.Item {...formItemLayout} name="email" label="用户名">
          <Input hidden disabled type="text" defaultValue={user.email}/>
          {user.email}
        </Form.Item>
        <Form.Item name="password" {...formItemLayout} label="密码" rules={[
          {
            required: true,
            message: '密码不能为空。'
          },
          {
            pattern: new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[^]{8,20}$/, "gm"),
            message: '至少8-20个字符，至少1个大写字母，1个小写字母和1个数字，其他可以是任意字符。'
          }
        ]}
        hasFeedback
        >
          <Input.Password
            placeholder="请输入密码"
            iconRender={passWordVisible => (passWordVisible ? <EyeTwoTone/> : <EyeInvisibleOutlined/>)}
          />
        </Form.Item>

      </Form>)}
    </Modal>;
  }

}

export default SetPasswordModal;
