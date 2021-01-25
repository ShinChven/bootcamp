import React, {useEffect, useState} from "react";
import {PageContainer} from "@ant-design/pro-layout";
import type {FeathersRESTfulResponse} from "@/services/client";
import client from "@/services/client";
import pagination from "@/utils/pagination";
import {useModel} from "@@/plugin-model/useModel";
import type {User} from "@/services/authentication";
import {Button, Card, Form, Input, message, Popconfirm, Space, Table, Tooltip} from "antd";
import type {ColumnProps} from "antd/es/table";
import {getQueries, swapQueries} from "@/utils/queries";
import styles from './Users.less';
import SetPassword from "@/pages/Admin/Users/components/SetPassword";
import {dateTime} from "@/utils/date-format";
import {DeleteOutlined, EditOutlined, KeyOutlined, PlusCircleFilled} from "@ant-design/icons";
import EditUser from "@/pages/Admin/Users/components/EditUser";

// React Hook 文档
// https://zh-hans.reactjs.org/docs/hooks-intro.html

/**
 * Manage Users
 * /api/users
 * @constructor
 */
const Users = () => {

  // 声明 Hooks
  // 只能在`函数`的`最顶层代码`中声明，不能在回调和逻辑运算中声明
  // https://zh-hans.reactjs.org/docs/hooks-rules.html#only-call-hooks-at-the-top-level
  // 因为 React Hook 非常依赖声明的顺序，每次 Render 的时候会根据声明的顺序来引用/重用声明的 React Hook

  // 声明 useState Hook
  // https://zh-hans.reactjs.org/docs/hooks-state.html
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [setPasswordTarget, setSetPasswordTarget] = useState<User | undefined>(undefined);
  const [updateUserInfoTarget, setUpdateUserInfoTarget] = useState<User | undefined>(undefined);
  const [addUserVisible, setAddUserVisible] = useState<boolean>(false);
  const [removed, setRemoved] = useState<number>(0)

  // 声明 自定义 Hook
  // @umijs/plugin-model useModel 可以像 model 一样存取全局的 state
  const {
    initialState, // 获取 initialState 这个命名空间中的 state
    // setInitialState, // 设置 initialState 这个命名空间中的 state
  } = useModel('@@initialState');

  const {
    page = 1,
    keyword,
    limit = 10,
  } = getQueries<{ page?: number, keyword?: string, limit?: number }>({'page': 'number', 'limit': 'number'});

  // 使用 effect 请求数据。 默认每次 setState 都会执行
  // https://zh-hans.reactjs.org/docs/hooks-effect.html
  useEffect(() => {
    setLoading(true);
    const query: { $limit: number, $skip: number, email?: { $like: string } } = {
      ...pagination(limit, page),
    }
    if (typeof keyword === 'string' && keyword.length > 0) {
      query.email = {$like: `%${keyword}%`}
    }
    client.service('api/users').find({
      query,
    }).then((response: FeathersRESTfulResponse<User>) => {
      if (Array.isArray(response.data)) {
        setUsers(response.data);
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
    // 通过绑定参数，控制 effect 只有在参数发生变化的时候才执行。
  }, [page, keyword, limit, updateUserInfoTarget, addUserVisible, removed]);

  const columns: ColumnProps<User>[] = [
    {
      title: 'email',
      key: 'email',
      dataIndex: 'email',
    },
    {
      title: 'access',
      key: 'access',
      dataIndex: 'access',
    },
    {
      title: 'created at',
      key: 'createdAt',
      dataIndex: 'createdAt',
      render: createdAt => dateTime(createdAt),
    },
    {
      title: 'options',
      key: 'option',
      align: 'right',
      render: (user: User) => {
        // 通过 initialState 获取全局/model 中的已登录用户信息
        const isCurrentUser = initialState?.currentUser?.id === user.id
        const elements = [
          <Tooltip key="edit_user_info" title={'Edit user'}><a
            onClick={() => setUpdateUserInfoTarget(user)}><EditOutlined/></a></Tooltip>,
          <Tooltip key="set_password" title={'Set password'}><a
            onClick={() => setSetPasswordTarget(user)}><KeyOutlined/></a></Tooltip>,
          <Popconfirm title="Are you sure to delete this user?"
                      disabled={isCurrentUser}
                      onConfirm={async () => {
                        const result = await client.service('/api/users').remove(user.id);
                        // removed 这个 state 被绑定到获取 Users 的 effect 中
                        // 更改这个 removed 以触发数据刷新
                        setRemoved(user.id!);
                        if (user.id === result?.id) {
                          message.success('User removed');
                        } else {
                          message.error('Failed to remove user.');
                        }
                      }}
                      key="delete"
          >
            <Tooltip title={isCurrentUser ? 'Cannot delete yourself' : 'Delete user'}><a
              style={{color: isCurrentUser ? 'lightgrey' : 'red'}}
            ><DeleteOutlined/></a></Tooltip>
          </Popconfirm>
        ];
        return <Space>
          {elements}
        </Space>;
      },
    },
  ];

  return <PageContainer>
    <Card
      extra={<Tooltip title={'add user'}>
        <Button type={"primary"} onClick={() => setAddUserVisible(true)}><PlusCircleFilled/>
        </Button>
      </Tooltip>}
      className={styles.CardSearchForm}
      loading={loading}
      title={<Form onFinish={(value) => {
        swapQueries({keyword: value.keyword === '' ? undefined : value.keyword});
      }}>
        <Form.Item
          label="Search" name="keyword" initialValue={keyword}>
          <Input allowClear={true}
                 onChange={(e) => {
                   if (e.target.value === '') {
                     swapQueries({keyword: undefined});
                   }
                 }}
                 disabled={loading}
                 style={{maxWidth: '300px'}}
                 placeholder="Type in keyword and press enter"/>
        </Form.Item>
      </Form>
      }>
      <Table rowKey='id' columns={columns} dataSource={users}
      />
    </Card>
    <EditUser
      key={'add_user_form'}
      visible={addUserVisible}
      onOk={() => {

      }}
      onClose={() => {
        setAddUserVisible(false)
      }}
    />
    <EditUser
      key={'update_user_form'}
      user={updateUserInfoTarget}
      visible={updateUserInfoTarget !== undefined}
      onOk={() => {

      }}
      onClose={() => {
        setUpdateUserInfoTarget(undefined)
      }}
    />
    <SetPassword
      key={'set_password_form'}
      user={setPasswordTarget}
      visible={setPasswordTarget !== undefined}
      onOk={() => {
      }}
      onClose={() => setSetPasswordTarget(undefined)}
    />
  </PageContainer>
}

export default Users;
