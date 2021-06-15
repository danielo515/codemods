//@flow
import { usePolyglot } from 'components/polyglotProvider';

import Logo from 'icons/Logo.svg';
import React from 'react';
import phrases from './AccountantHeader.phrases';
import styles from './AccountantHeader.scss';

function AccountantHeader({ managingCompanyName }) {
    const { __ } = usePolyglot(phrases);
    const whenManaging = () => (
        <div>
            <div className={styles.managingLabel}>{__('managing')}</div>
            <div className={styles.managingCompany}>{managingCompanyName}</div>
        </div>
    );
    const notManaging = () => (
        <a href="/" className={styles.logoLink}>
            <Logo className={styles.logoImage} />
        </a>
    );

    return (
        <div className={styles.background}>
            <div className={styles.container}>
                {managingCompanyName ? whenManaging() : notManaging}
            </div>
        </div>
    );
}

export default AccountantHeader;
