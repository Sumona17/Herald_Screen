import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Button, 
  Card, 
  Descriptions, 
  Space, 
  message, 
  Typography 
} from 'antd';
import jsPDF from 'jspdf';

// project imports
import MainCard from 'ui-component/cards/MainCard';

const { Title } = Typography;

const QuotePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { formData, applicationData } = location.state || {};

  if (!formData || !applicationData) {
    return (
      <MainCard title="Quote Details">
        <div style={{ textAlign: 'center' }}>No quote data available</div>
      </MainCard>
    );
  }

  const handleSubmitQuote = () => {
    // Implement quote submission logic
    message.success('Quote submitted successfully!');
    navigate('/free/new-submission');
  };

  const handleDownloadQuote = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text('Quote Details', 10, 20);

    // Add form data
    let yPosition = 30;
    doc.setFontSize(12);
    
    Object.entries(formData).forEach(([key, value], index) => {
      doc.text(`${key}: ${String(value)}`, 10, yPosition);
      yPosition += 10;
    });

    // Save the PDF
    doc.save('quote_details.pdf');
  };

  return (
    <MainCard 
      title="Quote Details" 
      secondary={
        <Space>
          <Button type="primary" onClick={handleSubmitQuote}>
            Submit Quote
          </Button>
          <Button onClick={handleDownloadQuote}>
            Download Quote
          </Button>
        </Space>
      }
    >
      <Card>
        <Descriptions bordered column={1}>
          {Object.entries(formData).map(([key, value]) => (
            <Descriptions.Item key={key} label={key}>
              {value === null || value === undefined 
                ? 'N/A' 
                : typeof value === 'object' 
                  ? JSON.stringify(value) 
                  : String(value)}
            </Descriptions.Item>
          ))}
        </Descriptions>
      </Card>
    </MainCard>
  );
};

export default QuotePage;