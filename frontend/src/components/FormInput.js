import React from "react";
import { Form, Input } from "antd";
import "./FormInputFeild.css";
 
const FormInput = ({
  name,
  label,
  rules = [],
  value,
  required,
  defaultValue,
  placeholder = "",
  ...rest
}) => {
  return (
    
    <Form.Item
    name={name}
    label={label}
    className="label"
    rules={[
      ...(required
        ? [{ required: true, message: `Please enter ${name}!` }]
        : []),
      ...rules,
    ]}
    labelCol={{ span: 24 }} // Makes label span full width
    wrapperCol={{ span: 24 }} // Makes input span full width
  >
    <Input
      placeholder={placeholder}
      value={value}
      defaultValue={defaultValue}
      {...rest}
      className="input"
    />
  </Form.Item>
  
    
  );
};
 
export default FormInput;
 