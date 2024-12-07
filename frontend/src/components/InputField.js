import { Form, Input } from 'antd';
import React from 'react';
import { generateRules } from 'utils/ruleUtils';

export default function InputField({ name, placeholder, fieldLabel }) {
  const rules = generateRules({
    required: true,
    fieldLabel: fieldLabel || placeholder
  });
  return (
    <Form.Item name={name} rules={rules}>
      <Input placeholder={placeholder} />
    </Form.Item>
  );
}
