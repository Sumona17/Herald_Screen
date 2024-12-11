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
  const [submittedFormData, setSubmittedFormData] = useState(null);
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

  const onFinish = async (values) => {
    try {
      setSubmitStatus({ type: null, message: null });
      console.log("Submitting values:", values);

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
        message: error.response?.data?.message || 'Failed to submit the form. Please try again.'
      });
      setIsModalVisible(true);
    }
  };

  const handleGetQuote = () => {
    navigate('/free/quote', { 
      state: { 
        formData: submittedFormData, 
        applicationData 
      } 
    });
  };

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
      <Form form={form} layout="vertical" onFinish={onFinish}
        onFinishFailed={(errorInfo) => {
          console.log('Form validation failed:', errorInfo);
          setSubmitStatus({
            type: 'error',
            message: 'Please fill in all required fields correctly.'
          });
          setIsModalVisible(true);
        }}>
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
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    );
  };

  const renderField = (field) => {
    const { risk_parameter_id, coverage_parameter_id, parameter_text, input_type, schema, section } = field;
    const fieldKey = risk_parameter_id || coverage_parameter_id;

    

   
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
