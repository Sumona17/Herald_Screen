import React, { useEffect, useState } from "react";
import { Form, Input, InputNumber, Select, DatePicker, Button, message, Spin, Tabs, Row, Col, Checkbox, Alert,Space } from "antd";
import axios from "axios";
import moment from "moment";

const { TabPane } = Tabs;
const { Option } = Select;

const DynamicForm = () => {
  const [form] = Form.useForm();
  const [applicationData, setApplicationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState("risk_values");
  const [industryOptions, setIndustryOptions] = useState([]);
  const [submitStatus, setSubmitStatus] = useState({ type: null, message: null });


  useEffect(() => {
    const fetchApplicationData = async () => {
      try {
        const response = await axios.post(
          "https://sandbox.heraldapi.com/applications",
          {
            products: ["prd_0050_herald_cyber", "prd_la3v_atbay_cyber", "prd_jk0g_cowbell_cyber"],
          },
          {
            headers: {
              Authorization: `Bearer E4xGG8aD+6kcbID50Z7dfntunn8wsHvXKxb5gBB1pdw=`,
            },
          }
        );

        if (response.data && response.data.application) {
          setApplicationData(response.data.application);

          // Check if Industry classification is part of the form and fetch options
          const hasIndustryField = response.data.application.risk_values.some(
            (field) => field.parameter_text.agent_facing_text === "Industry classification"
          );
          if (hasIndustryField) {
            fetchIndustryOptions();
          }
        } else {
          throw new Error("Invalid application data format received from API.");
        }
      } catch (error) {
        console.error("Error fetching application data:", error);
        message.error("Failed to fetch application data.");
      } finally {
        setLoading(false);
      }
    };

    fetchApplicationData();
  }, []);

  const fetchIndustryOptions = async () => {
    try {
      const response = await axios.get("https://sandbox.heraldapi.com/classifications/naics_index_entries", {
        headers: {
          // Accept: "application/json",
          Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwbGF0Zm9ybUlkIjoicGZtX2FxbDZfZXhhdmFsdSIsImlhdCI6MTczMzIwOTE1NywiZXhwIjoxNzMzMjk1NTU3fQ.Tn_OxSZ4RFbwRlI7lXdWIbPn355szI71wE7qK__PLqM", // Replace with the actual token
        },
      });
      if (response.data) {
        setIndustryOptions(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching industry classification data:", error);
      message.error("Failed to fetch industry classification data.");
    }
  };

  const onFinish = async (values) => {
    try {
      setSubmitStatus({ type: null, message: null });
      console.log("Submitting values:", values); // Debug log

      // Add any missing required fields from schema
      const formattedValues = {
        products: ["prd_0050_herald_cyber", "prd_la3v_atbay_cyber", "prd_jk0g_cowbell_cyber"],
        ...values
      };

      const response = await axios.post(
        "https://sandbox.heraldapi.com/applications",
        formattedValues,
        {
          headers: {
            Authorization: `Bearer E4xGG8aD+6kcbID50Z7dfntunn8wsHvXKxb5gBB1pdw=`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data) {
        setSubmitStatus({
          type: 'success',
          message: 'Application submitted successfully!'
        });
        console.log("Success response:", response.data);
      }
    } catch (error) {
      console.error("Submission error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      setSubmitStatus({
        type: 'error',
        message: error.response?.data?.message || 'Failed to submit the form. Please try again.'
      });
    }
  };
  const renderFormFields = (data) => {
    if (!data || data.length === 0) {
      return <p>No fields available.</p>;
    }

    const groupedSections = data.reduce((acc, field) => {
      const { section } = field;
      if (!acc[section]) {
        acc[section] = [];
      }
      acc[section].push(field);
      return acc;
    }, {});

    const handleGetQuote = () => {
      // Add your get quote logic here
      console.log("Getting quote...");
    };

    return (
      <Form form={form} layout="vertical" onFinish={onFinish}
        onFinishFailed={(errorInfo) => {
          console.log('Form validation failed:', errorInfo);
          setSubmitStatus({
            type: 'error',
            message: 'Please fill in all required fields correctly.'
          });
        }}>
        <Row gutter={16}>
          {/* Render Basic Information and Risk Information side by side */}
          {["Basic Information", "Risk Information"].map((sectionName) => (
            <Col span={12} key={sectionName}>
              {groupedSections[sectionName] && (
                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ borderBottom: "1px solid #ddd", paddingBottom: 8 }}>{sectionName}</h3>
                  {groupedSections[sectionName].map((field) => renderField(field))}
                </div>
              )}
            </Col>
          ))}
        </Row>
        {/* Render other sections normally */}
        {Object.entries(groupedSections)
          .filter(([sectionName]) => !["Basic Information", "Risk Information"].includes(sectionName))
          .map(([sectionName, fields]) => (
            <div key={sectionName} style={{ marginBottom: 24 }}>
              <h3 style={{ borderBottom: "1px solid #ddd", paddingBottom: 8 }}>{sectionName}</h3>
              {fields.map((field) => renderField(field))}
            </div>
          ))}
       <Form.Item>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
            
            {submitStatus.type && (
              <div>
                <Alert
                  message={submitStatus.message}
                  type={submitStatus.type}
                  showIcon
                  style={{
                    marginTop: 16,
                    marginBottom: 16,
                    borderRadius: 4,
                    ...(submitStatus.type === 'error' ? {
                      backgroundColor: '#FEF2F2',
                      border: '1px solid #FECACA',
                      color: '#DC2626'
                    } : {
                      backgroundColor: '#f0f9ff',
                      border: '1px solid #BAE6FD'
                    })
                  }}
                />
                {submitStatus.type === 'success' && (
                  <Button 
                    type="primary" 
                    onClick={handleGetQuote}
                    style={{ marginTop: 8 }}
                  >
                    Get Quote
                  </Button>
                )}
              </div>
            )}
          </Space>
        </Form.Item>
      </Form>
    );
  };

  const renderField = (field) => {
    const { risk_parameter_id, coverage_parameter_id, parameter_text, input_type, schema, section } = field;
    const fieldKey = risk_parameter_id || coverage_parameter_id;

    // Special handling for "Terms and Conditions"
    if (section === "Terms and Conditions") {
      return (
        <div key={fieldKey} style={{ marginBottom: 16 }}>
          {/* Render applicant_agree_to_text if available */}
          {parameter_text?.applicant_agree_to_text && (
            <div
              style={{
                maxHeight: "200px", // Set a fixed height
                overflowY: "auto", // Enable vertical scrolling
                border: "1px solid #ddd",
                padding: "10px",
                borderRadius: "5px",
                backgroundColor: "#f9f9f9",
              }}
            >
              <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>{parameter_text.applicant_agree_to_text}</p>
            </div>
          )}
          <Form.Item
            name={fieldKey}
            valuePropName="checked" // Handle checkbox state
            rules={[
              {
                required: true,
                message: "You must agree to the Terms and Conditions.",
              },
            ]}
          >
            <Checkbox>{schema?.title || "I Agree"}</Checkbox>
          </Form.Item>
        </div>
      );
    }

    switch (input_type) {
      case "short_text":
        return (
          <Form.Item
            key={fieldKey}
            name={fieldKey}
            label={parameter_text.agent_facing_text}
            rules={[
              { required: schema.min_length > 0, message: `Please enter ${parameter_text.agent_facing_text}` },
              { min: schema.min_length, message: `Minimum length is ${schema.min_length}` },
              { max: schema.max_length, message: `Maximum length is ${schema.max_length}` },
            ]}
          >
            <Input placeholder={`Enter ${parameter_text.agent_facing_text}`} />
          </Form.Item>
        );
      case "integer":
        return (
          <Form.Item
            key={fieldKey}
            name={fieldKey}
            label={parameter_text.agent_facing_text}
            rules={[{ required: false, message: `Please enter ${parameter_text.agent_facing_text}` }]}
          >
            <InputNumber style={{ width: "100%" }} placeholder={`Enter ${parameter_text.agent_facing_text}`} />
          </Form.Item>
        );
      case "email":
        return (
          <Form.Item
            key={fieldKey}
            name={fieldKey}
            label={parameter_text.agent_facing_text}
            rules={[{ required: false, message: `Please enter ${parameter_text.agent_facing_text}` }]}
          >
            <InputNumber style={{ width: "100%" }} placeholder={`Enter ${parameter_text.agent_facing_text}`} />
          </Form.Item>
        );
      case "phone":
        return (
          <Form.Item
            key={fieldKey}
            name={fieldKey}
            label={parameter_text.agent_facing_text}
            rules={[{ required: false, message: `Please enter ${parameter_text.agent_facing_text}` }]}
          >
            <InputNumber style={{ width: "100%" }} placeholder={`Enter ${parameter_text.agent_facing_text}`} />
          </Form.Item>
        );
      case "select_one":
        return (
          <Form.Item
            key={fieldKey}
            name={fieldKey}
            label={parameter_text.agent_facing_text}
            rules={[{ required: false, message: `Please select ${parameter_text.agent_facing_text}` }]}
          >
            <Select placeholder={`Select ${parameter_text.agent_facing_text}`}>
              {schema.enum &&
                schema.enum.map((option) => (
                  <Option key={option} value={option}>
                    {option}
                  </Option>
                ))}
            </Select>
          </Form.Item>
        );
      case "select_many":
        return (
          <Form.Item
            key={fieldKey}
            name={fieldKey}
            label={parameter_text.agent_facing_text}
            rules={[{ required: false, message: `Please select ${parameter_text.agent_facing_text}` }]}
          >
            <Select placeholder={`Select ${parameter_text.agent_facing_text}`}>
              {schema.items.enum &&
                schema.items.enum.map((option) => (
                  <Option key={option} value={option}>
                    {option}
                  </Option>
                ))}
            </Select>
          </Form.Item>
        );
      case "date":
        return (
          <Form.Item
            key={fieldKey}
            name={fieldKey}
            label={parameter_text.agent_facing_text}
            rules={[
              { required: true, message: `Please select ${parameter_text.agent_facing_text}` },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  const selectedDate = moment(value);
                  const minDate = moment(schema.min_date);
                  const maxDate = moment(schema.max_date);

                  if (selectedDate.isBefore(minDate) || selectedDate.isAfter(maxDate)) {
                    return Promise.reject(
                      new Error(`Date must be between ${schema.min_date} and ${schema.max_date}`)
                    );
                  }

                  return Promise.resolve();
                },
              },
            ]}
          >
            <DatePicker style={{ width: "100%" }} placeholder={`Select ${parameter_text.agent_facing_text}`} />
          </Form.Item>
        );
      case "address":
        return (
          <div key={fieldKey}>
            <h4>{parameter_text.agent_facing_text}</h4>
            {Object.entries(schema.properties).map(([key, propertySchema]) => {
              const fullKey = `${fieldKey}.${key}`;
              const isRequired = schema.required.includes(key);
              return (
                <Form.Item
                  key={fullKey}
                  name={fullKey}
                  label={propertySchema.title}
                  rules={[
                    { required: isRequired, message: `Please enter ${propertySchema.title}` },
                    propertySchema.min_length && {
                      min: propertySchema.min_length,
                      message: `Minimum length is ${propertySchema.min_length}`,
                    },
                    propertySchema.max_length && {
                      max: propertySchema.max_length,
                      message: `Maximum length is ${propertySchema.max_length}`,
                    },
                    propertySchema.pattern && {
                      pattern: new RegExp(propertySchema.pattern),
                      message: `Invalid ${propertySchema.title}`,
                    },
                  ]}
                >
                  {propertySchema.enum ? (
                    <Select placeholder={`Select ${propertySchema.title}`}>
                      {propertySchema.enum.map((option) => (
                        <Option key={option} value={option}>
                          {option}
                        </Option>
                      ))}
                    </Select>
                  ) : (
                    <Input placeholder={`Enter ${propertySchema.title}`} />
                  )}
                </Form.Item>
              );
            })}
          </div>
        );
      case "currency": // New case for currency input type
        return (
          <Form.Item
            key={fieldKey}
            name={fieldKey}
            label={parameter_text.agent_facing_text}
            rules={[
              { required: true, message: `Please enter ${parameter_text.agent_facing_text}` },
              { type: "number", min: schema.minimum, max: schema.maximum, message: `Value must be between ${schema.minimum} and ${schema.maximum}` },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder={`Enter ${parameter_text.agent_facing_text}`}
              formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} // Format as currency
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")} // Parse currency back to number
            />
          </Form.Item>
        );
      case "select_one":
        const isIndustryField = parameter_text.agent_facing_text === "Industry classification";
        const options = isIndustryField ? industryOptions : schema.enum;

        return (
          <Form.Item
            key={fieldKey}
            name={fieldKey}
            label={parameter_text.agent_facing_text}
            rules={[{ required: false, message: `Please select ${parameter_text.agent_facing_text}` }]}
          >
            <Select placeholder={`Select ${parameter_text.agent_facing_text}`}>
              {options &&
                options.map((option) => (
                  <Option key={option.code || option} value={option.code || option}>
                    {option.title || option}
                  </Option>
                ))}
            </Select>
          </Form.Item>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return <Spin size="large" style={{ display: "block", margin: "auto", marginTop: "20%" }} />;
  }

  if (!applicationData) {
    return <p style={{ textAlign: "center", marginTop: "20%" }}>No application data available.</p>;
  }

  const handleTabChange = (key) => {
    setCurrentTab(key);
    form.resetFields();
  };

  return (
    <Tabs defaultActiveKey="risk_values" onChange={handleTabChange}>
      <TabPane tab="Risk Values" key="risk_values">
        {renderFormFields(applicationData.risk_values)}
      </TabPane>
      <TabPane tab="Coverage Values" key="coverage_values">
        {renderFormFields(applicationData.coverage_values)}
      </TabPane>
      <TabPane tab="Products" key="products">
        {applicationData.products.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </TabPane>
    </Tabs>
  );
};

export default DynamicForm;
