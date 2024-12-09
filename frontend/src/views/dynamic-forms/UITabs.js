import React, { useEffect, useState } from "react";
import { Form, Input, InputNumber, Select, DatePicker, Button, message, Spin, Tabs } from "antd";
import axios from "axios";
import moment from "moment";

const { TabPane } = Tabs;
const { Option } = Select;

const DynamicForm = () => {
  const [form] = Form.useForm();
  const [applicationData, setApplicationData] = useState(null); // Holds the fetched application data
  const [loading, setLoading] = useState(true); // Loading state
  const [currentTab, setCurrentTab] = useState("risk_values"); // To track the active tab

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

  const renderFormFields = (data) => {
    if (!data || data.length === 0) {
      return <p>No fields available.</p>;
    }

    // Group fields by their section
    const groupedSections = data.reduce((acc, field) => {
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
              const { risk_parameter_id, coverage_parameter_id, parameter_text, input_type, schema } = field;
              const fieldKey = risk_parameter_id || coverage_parameter_id; // Use appropriate ID based on tab

              switch (input_type) {
                case "short_text":
                  return (
                    <Form.Item
                      key={fieldKey}
                      name={fieldKey}
                      label={parameter_text.applicant_facing_text}
                      rules={[
                        { required: schema.min_length > 0, message: `Please enter ${parameter_text.applicant_facing_text}` },
                        { min: schema.min_length, message: `Minimum length is ${schema.min_length}` },
                        { max: schema.max_length, message: `Maximum length is ${schema.max_length}` },
                      ]}
                    >
                      <Input placeholder={`Enter ${parameter_text.applicant_facing_text}`} />
                    </Form.Item>
                  );
                case "integer":
                  return (
                    <Form.Item
                      key={fieldKey}
                      name={fieldKey}
                      label={parameter_text.applicant_facing_text}
                      rules={[{ required: true, message: `Please enter ${parameter_text.applicant_facing_text}` }]}
                    >
                      <InputNumber style={{ width: "100%" }} placeholder={`Enter ${parameter_text.applicant_facing_text}`} />
                    </Form.Item>
                  );
                case "select_one":
                  return (
                    <Form.Item
                      key={fieldKey}
                      name={fieldKey}
                      label={parameter_text.applicant_facing_text}
                      rules={[{ required: true, message: `Please select ${parameter_text.applicant_facing_text}` }]}
                    >
                      <Select placeholder={`Select ${parameter_text.applicant_facing_text}`}>
                        {schema.enum &&
                          schema.enum.map((option) => (
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
                      label={parameter_text.applicant_facing_text}
                      rules={[
                        { required: true, message: `Please select ${parameter_text.applicant_facing_text}` },
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
                      <DatePicker
                        style={{ width: "100%" }}
                        placeholder={`Select ${parameter_text.applicant_facing_text}`}
                      />
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

  if (loading) {
    return <Spin size="large" style={{ display: "block", margin: "auto", marginTop: "20%" }} />;
  }

  if (!applicationData) {
    return <p style={{ textAlign: "center", marginTop: "20%" }}>No application data available.</p>;
  }

  const handleTabChange = (key) => {
    setCurrentTab(key);
    form.resetFields(); // Reset form fields when switching tabs
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
