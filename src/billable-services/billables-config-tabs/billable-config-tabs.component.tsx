import React, { useState } from 'react';
import { Tab, TabPanel, TabPanels, TabList, Tabs } from '@carbon/react';
import BillableServices from '../billable-services.component';
import { useTranslation } from 'react-i18next';
import BillableStock from '../charge-items/charge-items.component';

const BillablesConfigurationTabs = () => {
  const { t } = useTranslation();
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <div>
      <Tabs selectedIndex={selectedIndex} onChange={({ selectedIndex }) => setSelectedIndex(selectedIndex)}>
        <TabList contained>
          <Tab>{t('billableServices', 'Billable Services')}</Tab>
          <Tab>{t('billableStock', 'Billable Stock')}</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <BillableServices />
          </TabPanel>
          <TabPanel>
            <BillableStock />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
};

export default BillablesConfigurationTabs;
