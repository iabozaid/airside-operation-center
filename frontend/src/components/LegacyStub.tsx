import React from 'react';
import { Link } from 'react-router-dom';
import styles from './LegacyStub.module.css';

/* 
  Authority: Route Safety stub.
  Do not delete.
*/

export function LegacyStub({ name }: { name: string }) {
    return (
        <div className={styles.stub}>
            <div className={styles.header}>{name}</div>
            <p>This view is consolidated into Ops.</p>
            <Link to="/ops" className={styles.link}>
                Go to Operations Dashboard &rarr;
            </Link>
        </div>
    );
}
