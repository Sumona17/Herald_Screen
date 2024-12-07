import { Form, Input, Select, Row, Col, InputNumber } from 'antd';

import React from 'react';

export default function FormComp({ formObj }) {
  console.log(formObj);
  const [form] = Form.useForm();

  const renderFormItem = (field) => {
    const { fieldLabel, fieldType, options } = field;
    const placeholder = `Enter ${fieldLabel}`;
    const rules = [
      {
        required: 'true',
        message: `${fieldLabel} is required`
      }
    ];

    switch (fieldType) {
      case 'text':
        return (
          <Form.Item label={fieldLabel} rules={rules}>
            <Input placeholder={placeholder} />
          </Form.Item>
        );
      case 'number':
        return (
          <Form.Item label={fieldLabel} rules={rules}>
            <InputNumber placeholder={placeholder} style={{ width: '100%' }} />
          </Form.Item>
        );
      case 'dropdown':
        return (
          <Form.Item label={fieldLabel} rules={rules}>
            <Select placeholder={placeholder}>
              {options.map((option) => (
                <Select.Option key={option} label={option}>
                  {option}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        );
      case 'textarea':
        return (
          <Form.Item label={fieldLabel} rules={rules}>
            <Input.TextArea placeholder={placeholder} />
          </Form.Item>
        );
      default:
        return (
          <Form.Item label={fieldLabel} rules={rules}>
            <Input placeholder={placeholder} />
          </Form.Item>
        );
    }
  };

  return (
    <Form form={form} layout="vertical" style={{ maxWidth: 1000, margin: 'auto' }}>
      <Row gutter={[16, 16]}>
        {formObj.map((f) => (
          <Col span={8} key={f.fieldLabel}>
            {renderFormItem(f)}
          </Col>
        ))}
      </Row>
    </Form>
  );
}
