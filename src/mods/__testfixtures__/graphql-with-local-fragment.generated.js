// @flow
import { gql } from 'components/GraphQL';
import { USER_FRAGMENT } from './fragments';

const PROFILE_FRAGMENT = gql`
    fragment Profile on User {
        address
        birth_date
    }
`;

export const USER_QUERY = gql`
    query userQuery($companyID: ID) {
        viewer {
            id
            user(id: $companyID) {
                ...UserFragment
                profile {
                    ...profile
                }
            }
        }
    }
    ${USER_FRAGMENT}
    ${PROFILE_FRAGMENT}
`;
