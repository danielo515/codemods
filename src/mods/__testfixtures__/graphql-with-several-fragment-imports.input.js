// @flow
import { gql } from 'components/GraphQL';
import { USER_FRAGMENT } from './fragments';
import { RANDOM_FRAGMENT, FRIENDS_FRAGMENT } from './more-fragments';

const USER_QUERY = gql`
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

export default function Test() {
    const query = useQuery(USER_QUERY);
    return <div></div>;
}
