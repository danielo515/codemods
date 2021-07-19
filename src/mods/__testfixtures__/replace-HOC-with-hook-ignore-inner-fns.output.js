//@flow
import { usePolyglot } from 'components/polyglotProvider';

import Logo from 'icons/Logo.svg';
import React from 'react';
import phrases from './AccountantHeader.phrases';
import styles from './AccountantHeader.scss';

const AccountantHeader = ({
    managingCompanyName
}) => {
    const { __ } = usePolyglot(phrases);
    const helperFn = () => {
        return [1, 2, 3].forEach(() => console.log('helper called'));
    };
    const whenManaging = () => (
        <div onMouseEnter={helperFn}>
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
            <button
                onClick={(e) => {
                    console.log('something happened');
                }}
            >
                {__('save')}
            </button>
        </div>
    );
};

export default AccountantHeader;
