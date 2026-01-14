import React, { ReactNode } from 'react';
import styles from './CommandCenterLayout.module.css';


interface CommandCenterLayoutProps {
    map?: ReactNode;
    queue?: ReactNode;
    workbench?: ReactNode;
    children?: ReactNode;
}

export function CommandCenterLayout({ map, queue, workbench, children }: CommandCenterLayoutProps) {
    return (
        <div className={styles.container}>
            {children ? (
                <main className={styles.mainZone} style={{ display: 'block', overflow: 'hidden', position: 'relative' }}>
                    {children}
                </main>
            ) : (
                <>
                    {/* Zone 2: Main (Map + Queue) */}
                    <main className={styles.mainZone}>
                        <div className={styles.mapArea}>
                            {map}
                        </div>
                        <aside className={styles.queueArea}>
                            {queue}
                        </aside>
                    </main>

                    {/* Zone 3: Workbench */}
                    <footer className={styles.workbenchZone}>
                        {workbench}
                    </footer>
                </>
            )}
        </div>
    );
}

