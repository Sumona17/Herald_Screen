import React, { useEffect, useState } from "react";
import { Form, Input, InputNumber, Checkbox, Button, Select, message, Spin, Tabs } from "antd";
import axios from "axios";

const { TabPane } = Tabs;
const { Option } = Select;

const DynamicFormTab = () => {
  const [form] = Form.useForm();
  const [applicationData, setApplicationData] = useState(null); // Holds the fetched data
  const [loading, setLoading] = useState(true); // To manage loading state

  useEffect(() => {
    const fetchApplicationData = async () => {
      try {
        const response = await axios.post(
            "https://sandbox.heraldapi.com/applications",
            {
              products:[ 
                "prd_0050_herald_cyber",
      "prd_la3v_atbay_cyber",
      "prd_jk0g_cowbell_cyber"], // Example payload
            },
            {
              headers: {
                Authorization: `Bearer E4xGG8aD+6kcbID50Z7dfntunn8wsHvXKxb5gBB1pdw=`,
              },
            }
          );

        if (response.data && response.data.application) {
          setApplicationData(response.data.application);
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

  const onFinish = async (values) => {
    try {
        const response = await axios.post("https://sandbox.heraldapi.com/applications", values);
      message.success("Form submitted successfully!");
      console.log("API Response:", response.data);
    } catch (error) {
      console.error("Error submitting form:", error);
      message.error("Failed to submit the form. Please try again.");
    }
  };

  if (loading) {
    return <Spin size="large" style={{ display: "block", margin: "auto", marginTop: "20%" }} />;
  }

  if (!applicationData) {
    return <p style={{ textAlign: "center", marginTop: "20%" }}>No application data available.</p>;
  }

  // Tab Names Mapping
  const tabNames = {
    risk_values: "Risk Values",
    coverage_values: "Coverage Values",
    products: "Products",
  };

  // Render Risk Values Tab Content
  const renderRiskValues = () => {
    if (!applicationData.risk_values || applicationData.risk_values.length === 0) {
      return <p>No Risk Values available.</p>;
    }

    // Group fields by their section
    const groupedSections = applicationData.risk_values.reduce((acc, field) => {
      const { section } = field;
      if (!acc[section]) {
        acc[section] = [];
      }
      acc[section].push(field);
      return acc;
    }, {});

    return (
      <Form form={form} layout="vertical" onFinish={onFinish}>
        {Object.entries(groupedSections).map(([sectionName, fields]) => (
          <div key={sectionName} style={{ marginBottom: 24 }}>
            <h3 style={{ borderBottom: "1px solid #ddd", paddingBottom: 8 }}>{sectionName}</h3>
            {fields.map((field) => {
              const { risk_parameter_id, parameter_text, input_type, schema } = field;

              switch (input_type) {
                case "short_text":
                  return (
                    <Form.Item
                      key={risk_parameter_id}
                      name={risk_parameter_id}
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
                      key={risk_parameter_id}
                      name={risk_parameter_id}
                      label={parameter_text.agent_facing_text}
                      rules={[{ required: true, message: `Please enter ${parameter_text.agent_facing_text}` }]}
                    >
                      <InputNumber style={{ width: "100%" }} placeholder={`Enter ${parameter_text.agent_facing_text}`} />
                    </Form.Item>
                  );
                case "select_one":
                  return (
                    <Form.Item
                      key={risk_parameter_id}
                      name={risk_parameter_id}
                      label={parameter_text.agent_facing_text}
                      rules={[{ required: true, message: `Please select ${parameter_text.agent_facing_text}` }]}
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
                case "agree_to":
                  return (
                    <Form.Item
                      key={risk_parameter_id}
                      name={risk_parameter_id}
                      valuePropName="checked"
                      rules={[{ required: true, message: `You must agree to ${parameter_text.agent_facing_text}` }]}
                    >
                      <Checkbox>{parameter_text.agent_facing_text}</Checkbox>
                    </Form.Item>
                  );
                default:
                  return null;
              }
            })}
          </div>
        ))}
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    );
  };

  // Render Other Tabs Content
  const renderTabContent = (key) => {
    const data = applicationData[key];
    if (!data || data.length === 0) {
      return <p>No {tabNames[key]} available.</p>;
    }

    return (
      <ul>
        {data.map((item, index) => (
          <li key={index}>{typeof item === "string" ? item : JSON.stringify(item)}</li>
        ))}
      </ul>
    );
  };

  return (
    <Tabs defaultActiveKey="risk_values">
      {Object.keys(applicationData).map((key) => {
        if (tabNames[key]) {
          return (
            <TabPane tab={tabNames[key]} key={key}>
              {key === "risk_values" ? renderRiskValues() : renderTabContent(key)}
            </TabPane>
          );
        }
        return null;
      })}
    </Tabs>
  );
};

export default DynamicFormTab;
