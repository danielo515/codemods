// @flow
import { gql } from 'components/GraphQL';
import { USER_FRAGMENT } from './fragments';
import { FRIENDS_FRAGMENT } from './more-fragments';

export const USER_QUERY = gql`
    query userQuery($companyID: ID) {
        viewer {
            id
            company(id: $companyID) {
                ...UserFragment
            }
        }
    }
    ${USER_FRAGMENT}
    ${FRIENDS_FRAGMENT}
`;
