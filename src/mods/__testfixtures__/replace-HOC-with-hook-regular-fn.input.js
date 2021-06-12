import polyglotProvider from 'components/polyglotProvider';

import Logo from 'icons/Logo.svg';
import React from 'react';
import phrases from './AccountantHeader.phrases';
import styles from './AccountantHeader.scss';

function AccountantHeader({ __, managingCompanyName }) {
    return (
        <div className={styles.background}>
            <div className={styles.container}>
                {managingCompanyName ? (
                    <div>
                        <div className={styles.managingLabel}>
                            {__('managing')}
                        </div>
                        <div className={styles.managingCompany}>
                            {managingCompanyName}
                        </div>
                    </div>
                ) : (
                    <a href="/" className={styles.logoLink}>
                        <Logo className={styles.logoImage} />
                    </a>
                )}
            </div>
        </div>
    );
}

export default polyglotProvider(phrases)(AccountantHeader);
