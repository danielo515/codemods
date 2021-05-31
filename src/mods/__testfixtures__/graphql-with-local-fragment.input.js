// @flow
import { gql } from 'components/GraphQL';
import { USER_FRAGMENT } from './fragments';

const PROFILE_FRAGMENT = gql`
    fragment Profile on User {
        address
        birth_date
    }
`;

const USER_QUERY = gql`
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

export default function Test() {
    const query = useQuery(USER_QUERY);
    return <div></div>;
}
