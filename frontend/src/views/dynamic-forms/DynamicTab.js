import React, { useEffect, useState } from "react";
import { Form, Input, InputNumber, Select, DatePicker, Button, message, Spin, Tabs, Row, Col, Checkbox, Alert, Space, Modal } from "antd";
import axios from "axios";
import moment from "moment";
import { useNavigate } from 'react-router-dom';

const { TabPane } = Tabs;
const { Option } = Select;

const DynamicForm = () => {
  const [form] = Form.useForm();
  const [applicationData, setApplicationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState("risk_values");
  const [industryOptions, setIndustryOptions] = useState([]);
  const [submitStatus, setSubmitStatus] = useState({ type: null, message: null });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [riskValuesData, setRiskValuesData] = useState({});
  const [coverageValuesData, setCoverageValuesData] = useState({});
  const navigate = useNavigate();

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
          Accept: "application/json",
          Authorization: "Bearer E4xGG8aD+6kcbID50Z7dfntunn8wsHvXKxb5gBB1pdw=",
        },
      });
      if (response.data && response.data.classifications) {
        const classifications = response.data.classifications.map((item) => ({
          value: item.naics_2017_6_digit,
          label: `${item.naics_2017_6_digit_description} (${item.naics_2017_6_digit})`,
        }));
        setIndustryOptions(classifications);
      }
    } catch (error) {
      console.error("Error fetching industry classification data:", error);
      message.error("Failed to fetch industry classification data.");
    }
  };
  const handleNext = async () => {
    try {
      // Validate and save Risk Values data
      const riskValues = await form.validateFields();
      setRiskValuesData(riskValues);
      
      // Switch to Coverage Values tab
      setCurrentTab("coverage_values");
      form.resetFields();
    } catch (errorInfo) {
      console.log('Form validation failed:', errorInfo);
      message.error('Please fill in all required fields correctly.');
    }
};
const handleSubmit = async () => {
  try {
      // Validate and save Coverage Values data
      const coverageValues = await form.validateFields(
          applicationData.coverage_values.map(
              (field) => field.risk_parameter_id || field.coverage_parameter_id
          )
      );
      setCoverageValuesData(coverageValues);

      // Combine all form data
      const combinedValues = {
          ...riskValuesData,
          ...coverageValues,
          products: ["prd_0050_herald_cyber", "prd_la3v_atbay_cyber", "prd_jk0g_cowbell_cyber"],
          application_status: "complete" // Set application status to complete
      };

      console.log("Submitting combined values:", combinedValues);

      const response = await axios.post(
          "https://sandbox.heraldapi.com/applications",
          combinedValues,
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
              message: 'Application submitted successfully!',
          });
          setIsModalVisible(true);
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
          message: error.response?.data?.message || 'Failed to submit the form. Please try again.',
      });
      setIsModalVisible(true);
  }
};
const handleGetQuote = () => {
  navigate('/free/quotedetails', { 
      state: { 
          formData: { ...riskValuesData, ...coverageValuesData }, 
          applicationData 
      } 
  });
}

  const renderModalContent = () => {
    const isSuccess = submitStatus.type === 'success';
    
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ 
          fontSize: '24px', 
          marginBottom: '16px',
          color: isSuccess ? '#52c41a' : '#ff4d4f'
        }}>
          {isSuccess ? '✓' : '✕'}
        </div>
        <p style={{ 
          fontSize: '16px',
          marginBottom: '24px',
          color: isSuccess ? '#52c41a' : '#ff4d4f'
        }}>
          {submitStatus.message}
        </p>
        <Space>
          <Button onClick={() => setIsModalVisible(false)}>
            Close
          </Button>
          {isSuccess && (
            <Button type="primary" onClick={handleGetQuote}>
              Get Quote
            </Button>
          )}
        </Space>
      </div>
    );
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

    return (
      <Form 
        form={form} 
        layout="vertical"
        onFinishFailed={(errorInfo) => {
          console.log('Form validation failed:', errorInfo);
          setSubmitStatus({
            type: 'error',
            message: 'Please fill in all required fields correctly.'
          });
          setIsModalVisible(true);
        }}
      >
        <Row gutter={16}>
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
        {Object.entries(groupedSections)
          .filter(([sectionName]) => !["Basic Information", "Risk Information"].includes(sectionName))
          .map(([sectionName, fields]) => (
            <div key={sectionName} style={{ marginBottom: 24 }}>
              <h3 style={{ borderBottom: "1px solid #ddd", paddingBottom: 8 }}>{sectionName}</h3>
              {fields.map((field) => renderField(field))}
            </div>
          ))}
        
        {currentTab === "risk_values" ? (
          <Form.Item>
            <Button type="primary" onClick={handleNext}>
              Next
            </Button>
          </Form.Item>
        ) : (
          <Form.Item>
            <Button type="primary" onClick={handleSubmit}>
              Submit
            </Button>
          </Form.Item>
        )}
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
                required: false,
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
        // Check if the field is specifically for "Industry classification"
        if (parameter_text.agent_facing_text === "Industry classification") {
          return (
            <Form.Item
              key={fieldKey}
              name={fieldKey}
              label={parameter_text.agent_facing_text}
              rules={[{ required: false, message: `Please select ${parameter_text.agent_facing_text}` }]}
            >
              <Select placeholder={`Select ${parameter_text.agent_facing_text}`}>
                {industryOptions &&
                  industryOptions.map((option) => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
              </Select>
            </Form.Item>
          );
        }
     
        // Default `short_text` case for other fields
        return (
          <Form.Item
            key={fieldKey}
            name={fieldKey}
            label={parameter_text.agent_facing_text}
            rules={[{ required: false, message: `Please enter ${parameter_text.agent_facing_text}` }]}
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
              { required: false, message: `Please select ${parameter_text.agent_facing_text}` },
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
                    { required: false, message: `Please enter ${propertySchema.title}` },
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
              { required: false, message: `Please enter ${parameter_text.agent_facing_text}` },
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
    <>
      <Tabs 
        activeKey={currentTab} 
        onChange={handleTabChange}
      >
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

      <Modal
        title={submitStatus.type === 'success' ? "Success!" : "Error"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        centered
      >
        {renderModalContent()}
      </Modal>
    </>
  );
};

export default DynamicForm;
