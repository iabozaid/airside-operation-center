import React from 'react';
import styles from './PlaceholderPage.module.css';

interface PlaceholderPageProps {
    title: string;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title }) => (
    <div className={styles.container}>{title} (Pending)</div>
);
