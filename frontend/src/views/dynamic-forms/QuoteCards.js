import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, Button, Collapse, Tag } from "antd";
import { useNavigate } from "react-router-dom";

const { Panel } = Collapse;

const QuoteCards = () => {
  const [quotes, setQuotes] = useState([]);
  const navigate = useNavigate();

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
    navigate(`/new-submission/quotedetails`, {
      state: { formData: quote, applicationData: quote.coverage_values },
    });
  };

  return (
    <div>
      {quotes.map((quote) => (
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
      ))}
    </div>
  );
};

export default QuoteCards;
