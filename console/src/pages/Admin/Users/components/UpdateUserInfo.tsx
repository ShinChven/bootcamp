import React from "react";
import {Drawer} from "antd";
import {User} from "@/services/authentication";


export type UpdateUserInfoProps = {
  visible: boolean
  onOk: { (): void }
  onClose: { (): void }
  user?: User;
}

const UpdateUserInfo: React.FC<UpdateUserInfoProps> = ({visible, onOk, onClose, user}) => {

  return <Drawer title="Update User Info" visible={visible} onClose={() => onClose()}>

  </Drawer>
}

export default UpdateUserInfo;
