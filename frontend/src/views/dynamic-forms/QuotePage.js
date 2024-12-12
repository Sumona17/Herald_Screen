import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Button, 
  Card, 
  Descriptions, 
  Space, 
  message, 
  Typography,
  Tag,
  Collapse 
} from 'antd';
import jsPDF from 'jspdf';
import axios from 'axios';

// project imports
import MainCard from 'ui-component/cards/MainCard';

const { Title } = Typography;
const { Panel } = Collapse;

const QuotePage = () => {
  const [quotes, setQuotes] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const { formData, applicationData } = location.state || {};

  useEffect(() => {
    // Fetch the data from the API using axios
    const fetchData = async () => {
      try {
        const response = await axios.get("https://sandbox.heraldapi.com/quotes", {
          headers: {
            Authorization: "Bearer E4xGG8aD+6kcbID50Z7dfntunn8wsHvXKxb5gBB1pdw=",
          },
        });
        setQuotes(response.data.quotes);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const renderStatusTag = (status) => {
    switch (status) {
      case "declined":
        return <Tag color="red">Declined</Tag>;
      case "rejected":
        return <Tag color="red">Rejected</Tag>;
      case "referral":
        return <Tag color="purple">Referral</Tag>;
      default:
        return null;
    }
  };

  const renderPrice = (prices) => {
    if (prices) {
      return `$${prices}`;
    }
    return "N/A";
  };

  const handleGetQuote = (quote) => {
    navigate('/free/quotedetails', {
      state: { 
        formData: location.state?.formData, 
        applicationData: location.state?.applicationData,
        quoteDetails: quote,
        fromQuoteCards: true 
      },
    });
  };

  const handleSubmitQuote = () => {
    // Implement quote submission logic
    message.success('Quote submitted successfully!');
    navigate('/free/new-submission');
  };

  const handleDownloadQuote = () => {
    const dataToDownload = location.state?.formData || {};
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text('Quote Details', 10, 20);

    // Add form data
    let yPosition = 30;
    doc.setFontSize(12);
    
    Object.entries(dataToDownload).forEach(([key, value], index) => {
      doc.text(`${key}: ${String(value)}`, 10, yPosition);
      yPosition += 10;
    });

    // Save the PDF
    doc.save('quote_details.pdf');
  };

  // If a specific quote is selected from quote cards, show quote details
  if (formData && location.state?.fromQuoteCards) {
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
        
          {/* Quote-specific details */}
          {location.state?.quoteDetails && (
            <div style={{ marginTop: '20px' }}>
              <h3>Quote Information</h3>
              <Descriptions bordered column={1}>
                <Descriptions.Item label="Product">
                  {location.state.quoteDetails.product.name}
                </Descriptions.Item>
                <Descriptions.Item label="Price">
                  {location.state.quoteDetails.prices ? `$${location.state.quoteDetails.prices}` : 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  {location.state.quoteDetails.status}
                </Descriptions.Item>
              </Descriptions>
            </div>
          )}
        </Card>
      </MainCard>
    );
  }

  // Default view: show quote cards
  return (
    <MainCard title="Quotes">
      <div>
        {quotes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            No quotes available
          </div>
        ) : (
          quotes.map((quote) => (
            <Card
              key={quote.id}
              title={`${quote.product.name}`}
              extra={renderStatusTag(quote.status)}
              style={{ marginBottom: "20px" }}
            >
              <p>
                <strong>Price:</strong> {renderPrice(quote.prices)}
              </p>
              {quote.portal_link ? (
                <a href={quote.portal_link} target="_blank" rel="noopener noreferrer">
                  View in Carrier Portal
                </a>
              ) : (
                <p>No Portal Link Available</p>
              )}
              <div style={{ marginTop: "10px" }}>
                <Button type="primary" disabled={quote.status !== "referral"}>
                  Bind
                </Button>
                <Button style={{ marginLeft: "10px" }} onClick={() => handleGetQuote(quote)}>
                  Full Details
                </Button>
              </div>
              <Collapse style={{ marginTop: "20px" }}>
                <Panel header="Coverage Details" key="1">
                  {quote.coverage_values.map((coverage, index) => (
                    <p key={index}>
                      <strong>{coverage.parameter_text.agent_facing_text}:</strong> {coverage.value}
                    </p>
                  ))}
                </Panel>
              </Collapse>
            </Card>
          ))
        )}
      </div>
    </MainCard>
  );
};

export default QuotePage;