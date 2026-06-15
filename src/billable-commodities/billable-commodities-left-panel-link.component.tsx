import React, { useMemo } from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SideNavLink } from '@carbon/react';
import { navigate, UserHasAccess } from '@openmrs/esm-framework';

export interface BillableCommoditiesLinkConfig {
  name: string;
  title: string;
  path: string;
  icon?: React.ComponentType;
  privilege?: string;
}

function BillableCommoditiesLinkExtension({ config }: { config: BillableCommoditiesLinkConfig }) {
  const { title, path, icon: Icon, privilege } = config;
  const { t } = useTranslation();
  const location = useLocation();
  const spaBasePath = `${window.spaBase}/billable-commodities`;

  const isActive = useMemo(() => {
    const currentPath = location.pathname.replace(spaBasePath, '');
    if (path === '' || path === '/') {
      return currentPath === '' || currentPath === '/';
    }
    return currentPath.startsWith(`/${path}`);
  }, [location.pathname, path, spaBasePath]);

  const handleNavigation = () => {
    navigate({ to: `${spaBasePath}/${path}` });
  };

  const link = (
    <SideNavLink onClick={handleNavigation} renderIcon={Icon} isActive={isActive}>
      {t(title)}
    </SideNavLink>
  );

  if (privilege) {
    return <UserHasAccess privilege={privilege}>{link}</UserHasAccess>;
  }

  return link;
}

export const createBillableCommoditiesLeftPanelLink = (config: BillableCommoditiesLinkConfig) => () => (
  <BrowserRouter>
    <BillableCommoditiesLinkExtension config={config} />
  </BrowserRouter>
);
