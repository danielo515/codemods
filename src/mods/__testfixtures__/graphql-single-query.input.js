// @flow
import { gql } from 'components/GraphQL';

const USER_QUERY = gql`
    query userQuery($companyID: ID) {
        viewer {
            id
            name
            age
        }
    }
`;

export default function Test() {
    const query = useQuery(USER_QUERY);
    return <div>{JSON.stringify(query)}</div>;
}
