// Copyright 2022 Indoc Research
// 
// Licensed under the EUPL, Version 1.2 or – as soon they
// will be approved by the European Commission - subsequent
// versions of the EUPL (the "Licence");
// You may not use this work except in compliance with the
// Licence.
// You may obtain a copy of the Licence at:
// 
// https://joinup.ec.europa.eu/collection/eupl/eupl-text-eupl-12
// 
// Unless required by applicable law or agreed to in
// writing, software distributed under the Licence is
// distributed on an "AS IS" basis,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
// express or implied.
// See the Licence for the specific language governing
// permissions and limitations under the Licence.
// 

import React, { useState } from 'react';
import { Modal, Form, Radio, message, Input, Button, Tooltip } from 'antd';
import {
  ExclamationCircleOutlined,
  QuestionCircleOutlined,
  CheckCircleFilled,
  MailOutlined,
} from '@ant-design/icons';
import { connect } from 'react-redux';
import {
  addUserToDatasetAPI,
  inviteUserApi,
  checkUserPlatformRole,
  getFiles,
  createSubFolderApi,
} from '../../../../APIs';
import {
  validateEmail,
  formatRole,
  useCurrentProject,
} from '../../../../Utility';
import { namespace, ErrorMessager } from '../../../../ErrorMessages';
import { useTranslation } from 'react-i18next';
import styles from '../index.module.scss';
import { useKeycloak } from '@react-keycloak/web';

function AddUserModal(props) {
  const { isAddUserModalShown, cancelAddUser } = props;
  const [form] = Form.useForm();
  const [submitting, toggleSubmitting] = useState(false);
  const { t } = useTranslation(['errormessages', 'modals']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [role, setRole] = useState('admin');
  const [currentDataset = {}] = useCurrentProject();
  const { keycloak } = useKeycloak();
  const handleCancel = () => {
    form.resetFields();
    cancelAddUser();
  };

  function addUserToProject(email, role, username) {
    addUserToDatasetAPI(username, currentDataset.globalEntityId, role)
      .then(async (res) => {
        // successfully invited
        await props.getUsers();
        message.success(
          `${t('success:addUser.addUserToDataset.0')} ${username} ${t(
            'success:addUser.addUserToDataset.1',
          )} ${currentDataset.name}`,
        );
      })
      .catch((err) => {
        console.log(err);
        if (err.response?.status === 403) {
          //Already Project Member
          memberWarning(t, email);
        } else {
          const errorMessager = new ErrorMessager(
            namespace.teams.addUsertoDataSet,
          );
          errorMessager.triggerMsg(null, null, {
            email: email,
          });
        }
        return Promise.reject();
      })
      .then(async () => {
        await createFolderIfNotExist(username);
      })
      .catch((err) => {
        if (err.response?.status !== 409) {
          const errorMessager = new ErrorMessager(
            namespace.teams.addUsertoDataSet,
          );
          errorMessager.triggerMsg(null, null, {
            email: email,
          });
        }
      });
  }
  async function createFolderIfNotExist(username) {
    console.log('Before Greenroom');
    await createSubFolderApi(
      username,
      currentDataset.globalEntityId,
      currentDataset.code,
      username,
      'Greenroom',
    );
    console.log('After Greenroom, Before Core');
    await createSubFolderApi(
      username,
      currentDataset.globalEntityId,
      currentDataset.code,
      username,
      'Core',
    );
    console.log('After Core');
  }
  const onSubmit = () => {
    const values = form.getFieldsValue();
    setIsSubmitting(true);
    if (values && values.email) {
      const isValidEmail = validateEmail(values.email);

      if (!isValidEmail) {
        message.error(t('errormessages:addUser2Project.email'));
        setIsSubmitting(false);
        return;
      }

      toggleSubmitting(true);
      checkUserPlatformRole(
        values.email.toLowerCase(),
        currentDataset.globalEntityId,
      )
        .then((res) => {
          //block status === disabled
          if (res.status === 200) {
            if (res.data.result) {
              const invitedUser = res.data.result;
              const { role, status, name, relationship } = invitedUser;
              if (status === 'disabled') {
                //message.error(t('errormessages:addUser2Project.disabledUser'));
                toggleSubmitting(false);
                setIsSubmitting(false);
                Modal.warning({
                  title: t('errormessages:addUser2Project.disabledUser.title'),
                  content: `${values.email} ${t(
                    'errormessages:addUser2Project.disabledUser.content',
                  )}`,
                  className: styles['warning-modal'],
                });
              } else if (role === 'admin') {
                //message.error(t('errormessages:addUser2Project.platformAdmin'));
                Modal.warning({
                  title: t('errormessages:addUser2Project.platformAdmin.title'),
                  content: `${values.email} ${t(
                    'errormessages:addUser2Project.platformAdmin.content',
                  )}`,
                  className: styles['warning-modal'],
                });
                toggleSubmitting(false);
                setIsSubmitting(false);
              } else if (status === 'pending') {
                //message.error(t('errormessages:addUser2Project.pending'));
                toggleSubmitting(false);
                setIsSubmitting(false);
                Modal.warning({
                  title: t('errormessages:addUser2Project.pending.title'),
                  content: t('errormessages:addUser2Project.pending.content'),
                  className: styles['warning-modal'],
                });
              } else if (role === 'member') {
                if (relationship.hasOwnProperty('projectGeid')) {
                  memberWarning(t, values.email);
                } else {
                  addUserToProject(values.email, values.role, name);
                }
              }
            }
          }
        })
        .catch((err) => {
          toggleSubmitting(false);
          if (err.response && err.response.status === 404) {
            cancelAddUser();
            const email = values.email;
            const role = values.role;
            Modal.confirm({
              title: t('modals:inviteNoExist.title'),
              icon: <ExclamationCircleOutlined />,
              content: (
                <>
                  {' '}
                  <p>
                    {`${t('modals:inviteNoExist.content.0')} ${email} ${t(
                      'modals:inviteNoExist.content.1',
                    )}`}{' '}
                    {currentDataset.name.length < 30 ? (
                      `${currentDataset.name}`
                    ) : (
                      <Tooltip title={currentDataset.name}>
                        {currentDataset.name.slice(0, 28) + '...'}
                      </Tooltip>
                    )}{' '}
                    {`${t('modals:inviteNoExist.content.2')} ${formatRole(
                      role,
                    )}`}
                  </p>
                  <p>{`${t('modals:inviteNoExist.content.3')}`}</p>
                </>
              ),
              okText: (
                <>
                  <MailOutlined /> Send
                </>
              ),
              onOk() {
                if (err.response.data.result?.ad_account_created === true) {
                  addUser(true, err.response.data.result?.ad_user_dn, email, role);
                } else {
                  addUser(
                    false,
                    err.response.data.result?.ad_user_dn,
                    email,
                    role,
                  );
                }
              },
              className: styles['warning-modal'],
            });
          } else {
            const errorMessager = new ErrorMessager(
              namespace.teams.checkUserPlatformRole,
            );
            errorMessager.triggerMsg(
              err.response && err.response.status,
              null,
              {
                email: values.email,
              },
            );
          }
        })
        .finally(() => {
          cancelAddUser();
          setIsSubmitting(false);
          form.resetFields();
        });
    } else {
      message.error(t('formErrorMessages:common.email.valid'));
      setIsSubmitting(false);
    }
  };

  const onRoleChange = (e) => {
    setRole(e.target.value);
  };

  const addUser = async (inAd = false, adUserDn, userEmail, userRole) => {
    try {
      await inviteUserApi(
        userEmail,
        'member',
        userRole,
        currentDataset?.globalEntityId,
        keycloak.tokenParsed?.preferred_username,
        inAd,
        adUserDn,
      );
      //setCompletedUserAdd(true);
      if (!inAd) {
        message.success('Invitation email sent with AD request form attached');
      }
    } catch (err) {
      if (err.response) {
        const errorMessager = new ErrorMessager(namespace.teams.inviteUser);
        errorMessager.triggerMsg(err.response.status, null, {
          email: userEmail,
        });
      }
    }
  };
  return (
    <>
      <Modal
        title="Add a member to project"
        visible={isAddUserModalShown}
        maskClosable={false}
        closable={false}
        confirmLoading={submitting}
        onCancel={handleCancel}
        filterOption={(input, option) =>
          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
        footer={[
          <Button disabled={isSubmitting} key="back" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={isSubmitting}
            onClick={onSubmit}
          >
            Submit
          </Button>,
        ]}
        cancelButtonProps={{ disabled: submitting }}
      >
        <Form form={form} initialValues={{ role }}>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              {
                type: 'email',
                message: t('formErrorMessages:common.email.valid'),
              },
              {
                required: true,
                message: t('formErrorMessages:common.email.valid'),
              },
            ]}
          >
            <Input type="email" />
          </Form.Item>
          <Form.Item
            label="Role"
            name="role"
            rules={[
              {
                required: true,
                message: t(
                  'formErrorMessages:project.addMemberModal.role.empty',
                ),
              },
            ]}
          >
            <Radio.Group style={{ marginTop: 5 }} onChange={onRoleChange}>
              {props.rolesDetail &&
                props.rolesDetail.map((el) => (
                  <Radio value={el.value}>
                    {el.label}&nbsp;
                    <Tooltip title={el.description}>
                      <QuestionCircleOutlined />
                    </Tooltip>
                  </Radio>
                ))}
            </Radio.Group>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

export default connect((state) => ({
  userList: state.userList,
  containersPermission: state.containersPermission,
}))(AddUserModal);

function memberWarning(t, email) {
  Modal.warning({
    title: t('errormessages:addUsertoDataSet.403.title.0'),
    content: (
      <>
        {' '}
        <p>{`${email} ${t('errormessages:addUsertoDataSet.403.content.0')}`}</p>{' '}
        <p>{`${t('errormessages:addUsertoDataSet.403.content.1')}`} </p>
      </>
    ),
    className: styles['warning-modal'],
  });
}
