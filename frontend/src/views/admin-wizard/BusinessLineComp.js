import { Button, Col, Form, Input, Row, Select, Typography } from 'antd';
import businesslines from '../../utils/businesslines.json';
import React from 'react';

import { useEffect } from 'react';
import DropdownField from 'components/DropdownField';

export default function BusinessLine({ next }) {
  const [form] = Form.useForm();

  const presentBusinessLine = JSON.parse(localStorage.getItem('businessLines'));

  useEffect(() => {
    if (presentBusinessLine) {
      form.setFieldsValue({ lineOfBusiness: presentBusinessLine.lineOfBusiness });
    }
  }, []);

  const handleAddLine = (values) => {
    const newEntry = {
      // key: businessLines.length + 1,
      lineOfBusiness: values.lineOfBusiness
    };

    localStorage.setItem('businessLines', JSON.stringify(newEntry));
    next();
  };

  return (
    <div style={{ padding: '2%' }}>
      <Typography.Title level={4}>Select Line of Busines</Typography.Title>
      <Form form={form} layout="vertical" onFinish={handleAddLine}>
        <Row gutter={16} align="middle">
          <Col span={18}>
            <DropdownField
              name="lineOfBusiness"
              placeholder="Line of Business"
              options={businesslines}
              required={true}
              fieldLabel="Line of Business"
            />
          </Col>
          <Col span={3}>
            <Button type="primary" htmlType="submit">
              Next
            </Button>
          </Col>
        </Row>
      </Form>
    </div>
  );
}
