import React from 'react';
import { Truck, Car, Bot, X } from 'lucide-react';
import styles from './DispatchOverlay.module.css';

interface DispatchOverlayProps {
    onClose: () => void;
    onAssign: (assetId: string) => void;
}

export const DispatchOverlay: React.FC<DispatchOverlayProps> = ({ onClose, onAssign }) => {

    // Mock Assets
    const assets = [
        { id: 'FLT-01', type: 'Fleet', name: 'Rapid Response 1', eta: '2 min', available: true },
        { id: 'FLT-04', type: 'Fleet', name: 'Fire Engine 4', eta: '5 min', available: true },
        { id: 'BOT-99', type: 'Robot', name: 'Patrol Bot Alpha', eta: '1 min', available: true },
    ];

    return (
        <div className={styles.overlayContainer}>
            {/* Visual Markers on Map (Simulated) */}
            <div className={styles.mapMarker} style={{ top: '40%', left: '40%' }} title="FLT-01"></div>
            <div className={styles.mapMarker} style={{ top: '60%', left: '60%', background: '#f59e0b' }} title="BOT-99"></div>

            <div className={styles.card}>
                <div className={styles.header}>
                    <div className={styles.title}>
                        <Truck size={20} />
                        Dispatch Asset
                    </div>
                    <button className={styles.closeBtn} onClick={onClose}><X size={20} /></button>
                </div>

                <div className={styles.body}>
                    <div className={styles.subtitle}>Available Units Nearby</div>

                    <div className={styles.assetList}>
                        {assets.map(asset => (
                            <div key={asset.id} className={styles.assetItem} onClick={() => onAssign(asset.id)}>
                                <div className={styles.assetInfo}>
                                    <div className={styles.assetIcon}>
                                        {asset.type === 'Robot' ? <Bot size={18} /> : <Car size={18} />}
                                    </div>
                                    <div>
                                        <span className={styles.assetName}>{asset.name}</span>
                                        <span className={styles.assetMeta}>{asset.type} • {asset.id}</span>
                                    </div>
                                </div>
                                <div className={styles.eta}>{asset.eta}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
