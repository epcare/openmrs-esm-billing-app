import { Layer, Tile } from '@carbon/react';
import styles from './empty-state.scss';
import EmptyStateIllustration from './empty-state-illustration.component';
import React from 'react';

export const EmptyStateComponent = ({ title }) => {
  return (
    <Layer className={styles.layer}>
      <Tile className={styles.tile}>
        <EmptyStateIllustration />
        <p className={styles.content}>No data to display</p>
        <p className={styles.explainer}>{title ? title : ''}</p>
      </Tile>
    </Layer>
  );
};
