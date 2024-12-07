import React, { useState, useEffect } from 'react';
import { Form, Button, Modal, Space } from 'antd';
import InputField from 'components/InputField';
import DropdownField from 'components/DropdownField';
import { MinusCircleOutlined } from '@ant-design/icons';
import fieldTypes from '../../utils/fieldTypes.json';
import axios from 'axios';

export default function FieldsComponent({ handleCloseModal }) {
  const [tabs, setTabs] = useState([]);
  const [selectedTab, setSelectedTab] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    const storedTabs = JSON.parse(localStorage.getItem('tabs'));
    if (storedTabs) {
      setTabs(storedTabs.tabs);
    }
  }, []);

  const handleTabChange = (value) => {
    console.log(value);
    setSelectedTab(value);
    setSelectedSection(null);
    form.resetFields(['fields']); // Reset form fields when the tab changes
  };

  const handleSectionChange = (value) => {
    setSelectedSection(value);
    form.resetFields(['fields']); // Reset form fields when the section changes
  };

  const saveSectionFields = (values) => {
    const updatedTabs = tabs.map((tab) => {
      if (tab.tab === selectedTab) {
        return {
          ...tab,
          sections: tab.sections.map((section) => {
            if (section.sectionName === selectedSection) {
              return { ...section, fields: values.fields || [] };
            }
            return section;
          })
        };
      }
      return tab;
    });

    localStorage.setItem('tabs', JSON.stringify(updatedTabs));
    console.log(updatedTabs);
    const apiEndpoint = 'http://localhost:8082/api/form/saveform?state=NY&lineOfBusiness=Commercial';

    axios
      .post(`${apiEndpoint}`, updatedTabs)
      .then((res) => {
        Modal.success({ content: res.data });
        // handleCloseModal();
      })
      .catch((e) => console.log(e));
    setTabs(updatedTabs);
  };

  return (
    <div>
      <h3>Configure Elements</h3>
      <Form layout="vertical" form={form} onFinish={saveSectionFields}>
        {/* Tab Dropdown */}
        <DropdownField
          name="tab"
          placeholder="Choose a Tab"
          options={tabs.map((tab) => ({ value: tab.tab, label: tab.tab }))}
          required={true}
          fieldLabel="Field Tab"
          onChange={handleTabChange}
        />

        {/* Section Dropdown */}
        {selectedTab && (
          <DropdownField
            name="section"
            placeholder="Choose a Section"
            options={tabs
              .find((tab) => tab.tab === selectedTab)
              ?.sections.map((section) => ({
                value: section.sectionName,
                label: section.sectionName
              }))}
            required={true}
            fieldLabel="Field Section"
            onChange={handleSectionChange}
          />
        )}

        {/* Dynamic Fields Form */}
        {selectedSection && (
          <Form.List name="fields">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name }) => (
                  <Space key={key} align="baseline" style={{ display: 'flex', marginBottom: 8 }}>
                    <InputField name={[name, 'fieldLabel']} placeholder="Field Label" required={true} fieldLabel="Field Label" />

                    <DropdownField
                      name={[name, 'fieldType']}
                      placeholder="Field Type"
                      required={true}
                      fieldLabel="Field Type"
                      options={fieldTypes}
                    />

                    <DropdownField
                      name={[name, 'fieldRequired']}
                      placeholder="Required"
                      options={[
                        { value: 'required', label: 'Required' },
                        { value: 'optional', label: 'Optional' }
                      ]}
                      required={true}
                      fieldLabel="Field Requirement"
                    />

                    <MinusCircleOutlined onClick={() => remove(name)} />

                    {/* Render Dropdown Options Dynamically */}
                    <Form.Item noStyle shouldUpdate={(prev, curr) => prev.fields?.[name]?.fieldType !== curr.fields?.[name]?.fieldType}>
                      {() =>
                        form.getFieldValue(['fields', name, 'fieldType']) === 'dropdown' && (
                          <Form.List name={[name, 'options']}>
                            {(options, { add, remove }) => (
                              <div style={{ marginLeft: '20px' }}>
                                {options.map(({ key: optionKey, name: optionName }) => (
                                  <Space key={optionKey} align="baseline" style={{ display: 'flex', marginBottom: 8 }}>
                                    <InputField
                                      name={[optionName]}
                                      placeholder="Dropdown Option"
                                      required={true}
                                      fieldLabel="Dropdown Option"
                                    />
                                    <MinusCircleOutlined onClick={() => remove(optionName)} />
                                  </Space>
                                ))}
                                <Button type="dashed" onClick={() => add()}>
                                  Add Option
                                </Button>
                              </div>
                            )}
                          </Form.List>
                        )
                      }
                    </Form.Item>
                  </Space>
                ))}

                <Button type="dashed" onClick={() => add()}>
                  Add Field
                </Button>
              </>
            )}
          </Form.List>
        )}

        {/* Save Button */}
        {selectedSection && (
          <div style={{ marginTop: 20 }}>
            <Button type="primary" htmlType="submit">
              Done
            </Button>
          </div>
        )}
      </Form>
    </div>
  );
}
