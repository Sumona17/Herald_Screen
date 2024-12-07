import { Form, Select } from 'antd';
import React from 'react';
import { generateRules } from 'utils/ruleUtils';

export default function DropdownField({ name, fieldLabel, placeholder, options, onChange }) {
  const rules = generateRules({
    required: true,
    fieldLabel: fieldLabel || placeholder
  });
  return (
    <Form.Item name={name} rules={rules}>
      <Select placeholder={placeholder} onChange={onChange}>
        {options.map((option) => (
          <Select.Option key={option.value} value={option.value}>
            {option.label}
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
  );
}
