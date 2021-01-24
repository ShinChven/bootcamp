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

const Users = () => {

  const {initialState} = useModel('@@initialState');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [setPasswordTarget, setSetPasswordTarget] = useState<User | undefined>(undefined);
  const [updateUserInfoTarget, setUpdateUserInfoTarget] = useState<User | undefined>(undefined);
  const [addUserVisible, setAddUserVisible] = useState<boolean>(false);
  const [removed, setRemoved] = useState<number>(0)

  const {
    page = 1,
    keyword,
    limit = 10,
  } = getQueries<{ page?: number, keyword?: string, limit?: number }>({'page': 'number', 'limit': 'number'});

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
        const isCurrentUser = initialState?.currentUser?.id === user.id
        const elements = [
          <Tooltip key="edit_user_info" title={'Edit user'}><a
            onClick={() => setUpdateUserInfoTarget(user)}><EditOutlined/></a></Tooltip>,
          <Tooltip key="set_password" title={'Set password'}><a
            onClick={() => setSetPasswordTarget(user)}><KeyOutlined/></a></Tooltip>
        ];
        elements.push(
          <Popconfirm title="Are you sure to delete this user?"
                      disabled={isCurrentUser}
                      onConfirm={async () => {
                        const result = await client.service('/api/users').remove(user.id);
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
        )
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
