// @flow
import { gql } from 'components/GraphQL';
import { USER_FRAGMENT } from './fragments';

const USER_QUERY = gql`
    query companyViewQuery($companyID: ID) {
        viewer {
            id
            company(id: $companyID) {
                ...UserFragment
            }
        }
    }
    ${USER_FRAGMENT}
`;

export default function Test() {
    const query = useQuery(USER_QUERY);
    return <div></div>;
}
