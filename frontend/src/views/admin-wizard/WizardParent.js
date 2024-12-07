import { Modal, Steps } from 'antd';
import React from 'react';
import { useState } from 'react';
import BusinessLine from './BusinessLineComp';
import CategoriesComp from './CategoriesComp';
import SectionComp from './SectionComp';

import FieldsComponent from './FieldsComponent';

const { Step } = Steps;

export default function WizardParent() {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const handleCloseModal = () => setIsModalOpen(false);

  const steps = [
    {
      title: 'Step 1',
      content: <BusinessLine next={() => setCurrentStep(currentStep + 1)} />
    },
    {
      title: 'Step 2',
      content: <CategoriesComp prev={() => setCurrentStep(currentStep - 1)} next={() => setCurrentStep(currentStep + 1)} />
    },
    {
      title: 'Step 3',
      content: <SectionComp prev={() => setCurrentStep(currentStep - 1)} next={() => setCurrentStep(currentStep + 1)} />
    },
    {
      title: 'Step 4',
      content: <FieldsComponent prev={() => setCurrentStep(currentStep - 1)} handleCloseModal={handleCloseModal} />
    }
  ];
  const modalstyle = {
    height: '70%',
    overflowY: 'auto',
    marginLeft: '20%',
    borderRadius: 0
  };

  return (
    <>
      <Modal
        width={1000}
        style={modalstyle}
        title="Configure Screens"
        visible={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Steps current={currentStep} style={{ marginBottom: 24 }}>
          {steps.map((step, index) => (
            <Step key={index} title={step.title} />
          ))}
        </Steps>
        <div>{steps[currentStep].content}</div>
      </Modal>
    </>
  );
}
