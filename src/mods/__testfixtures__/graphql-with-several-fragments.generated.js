// @flow
import { gql } from 'components/GraphQL';
import { USER_FRAGMENT, FRIENDS_FRAGMENT } from './fragments';

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
