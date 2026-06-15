import React from 'react';
import { useTranslation } from 'react-i18next';
import { ClickableTile } from '@carbon/react';
import { Cube } from '@carbon/react/icons';
import styles from './item.scss';

const Item = () => {
  const { t } = useTranslation();
  const openmrsSpaBase = window['getOpenmrsSpaBase']();

  return (
    <ClickableTile className={styles.customTile} id="menu-item" href={`${openmrsSpaBase}billable-commodities`}>
      <div className="customTileTitle">{<Cube size={24} />}</div>
      <div>{t('billableCommodities', 'Billable commodities')}</div>
    </ClickableTile>
  );
};
export default Item;
