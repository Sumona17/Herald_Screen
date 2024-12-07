import { Button, Col, Form, Input, Row, Space, Typography } from 'antd';

import React, { useEffect } from 'react';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import InputField from 'components/InputField';

export default function CategoriesComp({ prev, next }) {
  const [form] = Form.useForm();

  const existingJSON = JSON.parse(localStorage.getItem('businessLines')).lineOfBusiness;

  const presentTabs = JSON.parse(localStorage.getItem('tabs'));
  useEffect(() => {
    if (presentTabs) {
      form.setFieldsValue({ tabs: presentTabs.tabs });
    }
  }, []);

  const handleUpdateJSON = (values) => {
    const newEntry = {
      lineOfBusiness: existingJSON.lineOfBusiness,
      tabs: values.tabs.map((tab) => ({
        ...tab,
        sections: []
      }))
    };
    localStorage.setItem('tabs', JSON.stringify(newEntry));
    next();
  };

  return (
    <div style={{ padding: '2%' }}>
      <Typography.Title level={4}>Configure Tabs</Typography.Title>
      <Form form={form} layout="vertical" onFinish={handleUpdateJSON}>
        <Form.List name="tabs">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Space
                  key={key}
                  style={{
                    display: 'flex',
                    marginBottom: 8
                  }}
                  align="baseline"
                >
                  <InputField name={[name, 'tab']} placeholder="Tab" required={true} fieldLabel="Tab" />

                  <MinusCircleOutlined onClick={() => remove(name)} />
                </Space>
              ))}
              <Form.Item>
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  Add Tab
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
        <div style={{ display: 'flex' }}>
          <Form.Item>
            <Button onClick={prev}>Previous</Button>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ marginLeft: '5%' }}>
              Next
            </Button>
          </Form.Item>
        </div>
      </Form>
    </div>
  );
}
