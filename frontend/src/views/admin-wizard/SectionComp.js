import { Button, Card, Form, Input, Select, Space, Typography } from 'antd';
import React, { useState } from 'react';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import DropdownField from 'components/DropdownField';
import InputField from 'components/InputField';

export default function SectionComp({ prev, next }) {
  const [currentTab, setCurrentTab] = useState(null);
  const [currentJSON, setCurrentJSON] = useState({});
  const existingJSON = JSON.parse(localStorage.getItem('tabs')) || { tabs: [] };

  const [form] = Form.useForm();

  const handleDone = async () => {
    try {
      const values = await form.validateFields();

      const updatedSections = values.sections.map((section) => ({
        ...section,
        fields: []
      }));

      const updatedJSON = existingJSON.tabs.map((tab) => (tab.tab === currentTab ? { ...tab, sections: updatedSections } : tab));

      const updatedData = { tabs: updatedJSON };
      setCurrentJSON(updatedData);
      localStorage.setItem('tabs', JSON.stringify(updatedData));

      setCurrentTab(null);
      // form.resetFields();
    } catch (error) {
      console.error('Validation Failed:', error);
    }
  };

  const handleUpdateJSON = () => {
    next();
  };

  const handleChangeTab = (tab) => {
    setCurrentTab(tab);

    const tabData = existingJSON.tabs.find((t) => t.tab === tab) || {};
    form.setFieldsValue({
      sections: tabData.sections || []
    });
  };

  return (
    <div style={{ padding: '2%' }}>
      <Typography.Title level={4}>Configure Sections For Tabs</Typography.Title>
      <Form form={form} layout="vertical" onFinish={handleUpdateJSON}>
        {/* Tab Selection */}

        <DropdownField
          name="tab"
          placeholder="Choose a Tab"
          options={existingJSON.tabs.map((tab) => ({ value: tab.tab, label: tab.tab }))}
          required={true}
          fieldLabel="Tab"
          onChange={handleChangeTab}
        />

        {/* Sections Form */}
        <Card title={currentTab ? `Add Sections For: ${currentTab}` : 'Select a Tab to Add Section'} style={{ flex: 2 }}>
          {currentTab ? (
            <Form.List name="sections">
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
                      <InputField name={[name, 'sectionName']} placeholder="Section Name" fieldLabel="Section Name" required={true} />

                      <MinusCircleOutlined onClick={() => remove(name)} />
                    </Space>
                  ))}
                  <Form.Item>
                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                      Add Section
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          ) : (
            <Typography.Text type="secondary">Please select a tab to add sections.</Typography.Text>
          )}

          {currentTab && (
            <Form.Item>
              <Space>
                <Button onClick={() => setCurrentTab(null)}>Cancel</Button>
                <Button type="primary" onClick={handleDone}>
                  Done
                </Button>
              </Space>
            </Form.Item>
          )}
        </Card>

        {/* Navigation Buttons */}
        <div style={{ display: 'flex', marginTop: '20px' }}>
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
