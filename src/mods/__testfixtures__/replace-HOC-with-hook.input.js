import Avatar from 'components/Avatar/Avatar';
import Navigation from 'components/Navigation/Navigation';
import polyglotProvider from 'components/polyglotProvider';

import Logo from 'icons/Logo.svg';
import React from 'react';
import phrases from './AccountantHeader.phrases';
import styles from './AccountantHeader.scss';

const AccountantHeader = ({ __, photo, managingCompanyName, isAdmin }) => {
    const navigationLinks = [
        { text: __('bookkeeperDashboard'), route: '/companies' },
    ];

    if (isAdmin) {
        navigationLinks.push({
            text: __('settings'),
            route: '/companies/settings',
        });
    }

    navigationLinks.push({
        text: <Avatar photo={photo} />,
        route: '/companies/member-settings',
        isPicture: true,
    });

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
                <div>
                    <Navigation links={navigationLinks} />
                </div>
            </div>
        </div>
    );
};

export default polyglotProvider(phrases)(AccountantHeader);
