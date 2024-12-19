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
  Collapse, 
  Spin
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
  const [loading, setLoading] = useState(true);

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
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderStatusTag = (status) => {
    switch (status) {
      case "active":
        return <Tag color="green">Success</Tag>;
      case "declined":
        return <Tag color="red">Declined</Tag>;
      case "rejected":
        return <Tag color="red">Rejected</Tag>;
      default:
        return null;
    }
  };

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    // Handle if price is an object with a specific property (adjust based on your actual price object structure)
    if (typeof price === 'object') {
      // Assuming the price object has a value or amount property
      const priceValue = price.value || price.amount || Object.values(price)[0];
      return typeof priceValue === 'number' ? `$${priceValue.toLocaleString()}` : 'N/A';
    }
    // Handle if price is a number
    return typeof price === 'number' ? `$${price.toLocaleString()}` : 'N/A';
  };


  const handleGetQuote = (quote) => {
    navigate('/new-submission/quotedetails', {
      state: { 
        formData: location.state?.formData, 
        applicationData: location.state?.applicationData,
        quoteDetails: quote,
        riskValues: quote.risk_values, 
        coverageValues: quote.coverage_values, 
        fromQuoteCards: true 
      },
    });
  };

  const handleSubmitQuote = () => {
    message.success('Quote submitted successfully!');
    navigate('/new-submission');
  };

  const handleDownloadQuote = () => {
    const dataToDownload = location.state?.formData || {};
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Quote Details', 10, 20);

    let yPosition = 30;
    doc.setFontSize(12);
    
    Object.entries(dataToDownload).forEach(([key, value]) => {
      doc.text(`${key}: ${String(value)}`, 10, yPosition);
      yPosition += 10;
    });

    doc.save('quote_details.pdf');
  };

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
          {/* Form Data
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
          </Descriptions>*/}
        
          {/* Quote-specific details */}
          {location.state?.quoteDetails && (
            <div style={{ marginTop: '20px' }}>
              <h3>Quote Information</h3>
              <Descriptions bordered column={1}>
                <Descriptions.Item label="Product">
                  {location.state.quoteDetails.product.name}
                </Descriptions.Item>
                <Descriptions.Item label="Price">
                  {formatPrice(location.state.quoteDetails.prices)}
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  {location.state.quoteDetails.status}
                </Descriptions.Item>
              </Descriptions>
              
              {/* Risk and Coverage Values under Quote Details */}
              <h3 style={{ marginTop: '20px' }}>Risk and Coverage Details</h3>
              <Descriptions bordered column={1}>
                {location.state.riskValues?.map((risk, index) => (
                  <Descriptions.Item key={`risk-${index}`} label={risk.parameter_text.agent_facing_text}>
                    {risk.value}
                  </Descriptions.Item>
                ))}
                {location.state.coverageValues?.map((coverage, index) => (
                  <Descriptions.Item key={`coverage-${index}`} label={coverage.parameter_text.agent_facing_text}>
                    {coverage.value}
                  </Descriptions.Item>
                ))}
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
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin size="large" style={{ display: "block", margin: "auto", marginTop: "20%" }} />;
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
                <strong>Price:</strong> {formatPrice(quote.prices)}
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
                  {quote?.coverage_values?.map((coverage, index) => (
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
