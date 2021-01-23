import React from "react";
import {PageHeaderWrapper} from "@ant-design/pro-layout";
import {Button, Card, message, Popconfirm, Space, Switch, Table} from "antd";
import {AuthenticationState, User} from "@/models/authentication";
import {FeathersRESTfulResponse, usersService} from "@/services/client";
import EditUserInfoModal from "@/pages/Users/components/EditUserInfoModal";
import SetPasswordModal from "@/pages/Users/components/SetPasswordModal";
import {connect} from "@@/plugin-dva/exports";
import {ConnectState} from "@/models/connect";
import {getQueries, swapQueries} from "@/utils/query";
import pagination from "@/utils/pagination";
import {TablePaginationConfig} from "antd/lib/table";
import {PlusCircleOutlined} from "@ant-design/icons/lib";

interface UsersProps {
  authentication: AuthenticationState;
  dispatch: Function;
}

interface UsersState {
  users?: User[]
  tablePagination: TablePaginationConfig
  loading: boolean
  setPasswordTarget?: User
  editInfoTarget?: User
  isCreatingUser: boolean
}

interface DataLoadingOptions {
  page: number;
  keyword?: string;
  showLoading?: boolean;
}

class Users extends React.PureComponent<UsersProps> {

  state: UsersState = {
    loading: false,
    isCreatingUser: false,
    tablePagination: {
      current: 0,
      total: 0,
      pageSize: 10,
    },
  }

  componentDidMount() {
    const {page} = getQueries();
    let targetPage = 1;
    if (page > 0) {
      targetPage = parseInt(page, 10);
    }
    this.loadData({page: targetPage, showLoading: true}).then();
  }

  loadData = async (options?: DataLoadingOptions | undefined) => {
    window.scrollTo(0, 0);
    if (options && options.showLoading) {
      this.setState({loading: true});
    }
    const {tablePagination} = this.state;
    const page = options?.page || 1;
    try {
      const response: FeathersRESTfulResponse<User> = await usersService.find({
        query: {
          ...pagination(tablePagination.pageSize, page),
        }
      });
      tablePagination.current = page;
      tablePagination.total = response.total;
      this.setState({users: response.data, loading: false, tablePagination});
      swapQueries({page});
    } catch (e) {
      // do nothing
    }
    this.setState({loading: false});
  }

  patchUser = async (id: number, payload: User): Promise<void> => {

    try {
      if (id > 0) {
        await usersService.patch(id, payload);
        await this.loadData(undefined);
        message.success('操作成功');
      }
      return Promise.resolve();
    } catch (e) {
      // do nothing
    }
    message.error('操作失败');
    return Promise.resolve();
  }

  removeUser = async (id?: number) => {
    const {authentication} = this.props;
    const {user} = authentication;
    if (user && user.id === id) {
      message.error('无法删除当前用户');
      return Promise.resolve();
    }
    try {
      if (id && id > 0) {
        const updated = await usersService.remove(id);
        if (updated.id > 0) {
          message.success('删除成功');
          await this.loadData(undefined);
          return Promise.resolve();
        }
      }
    } catch (e) {
      // do nothing
    }
    message.error('删除失败');
    return Promise.resolve();
  }

  renderActions = (user: User) => {
    const {authentication} = this.props;
    const currentUser = authentication.user;
    let currentId: number = -1;
    if (currentUser && currentUser.id) {
      currentId = currentUser.id;
    }
    return <Space direction="horizontal">
      <Switch checkedChildren="开启"
              unCheckedChildren="关闭"
              defaultChecked={user.enabled === 1}
              onChange={(val: boolean) => {
                this.patchUser(user.id || -1, {enabled: val ? 1 : 0})
                  .then();
              }}
      />
      <a onClick={() => this.setState({setPasswordTarget: user})}>设置密码</a>
      {user.id !== currentId && (<Popconfirm title="确认删除此用户吗？" onConfirm={() => this.removeUser(user.id).then()}
                                             onCancel={undefined}
      >
        <a style={{color: 'red'}}>删除</a>
      </Popconfirm>)}
    </Space>
  }

  render() {
    const {users = [], loading, setPasswordTarget, isCreatingUser, editInfoTarget, tablePagination} = this.state;
    const columns: Array<any> = [
      {
        title: 'email',
        key: 'email',
        render: (user: User) =>
          <a onClick={() => this.setState({editInfoTarget: user})}>{user.email}</a>,
      },
      {
        title: 'action',
        key: 'action',
        render: this.renderActions,
        width: 200,
        fixed: 'right'
      }
    ];

    return <PageHeaderWrapper
      content={<div/>}
      extraContent={<div>
        <Button onClick={() => this.setState({isCreatingUser: true})} type="primary"><PlusCircleOutlined />创建</Button>
        <EditUserInfoModal visible={isCreatingUser}
                           onOk={() => {
                             this.loadData(undefined).then()
                             const {dispatch} = this.props;
                             if (typeof dispatch === 'function') {
                               dispatch({
                                 type: 'authentication/reAuthentication',
                                 payload: undefined,
                               })
                             }
                           }}
                           onClose={() => this.setState({isCreatingUser: false})}
        />
      </div>}>
      <Card loading={loading}>
        <Table rowKey='id' columns={columns} dataSource={users}
               pagination={{
                 ...tablePagination,
                 onChange: (page) => {
                   this.loadData({page}).then();
                 },
               }}
        />
        <EditUserInfoModal visible={!!editInfoTarget}
                           user={editInfoTarget}
                           onOk={() => {
                             this.loadData(undefined).then()
                           }}
                           key={`edit_user_${editInfoTarget?.id}`}
                           onClose={() => this.setState({editInfoTarget: undefined})}
        />
        <SetPasswordModal
          visible={!!setPasswordTarget}
          user={setPasswordTarget}
          key={setPasswordTarget ? setPasswordTarget.id || -1 : -1}
          onOk={() => message.success('编辑成功')}
          onClose={() => this.setState({setPasswordTarget: undefined})}
        />
      </Card>
    </PageHeaderWrapper>;
  }

}

export default connect(({authentication}: ConnectState) => ({
  authentication,
}))(Users);

