// @flow
import { gql } from 'components/GraphQL';

export const USER_QUERY = gql`
    query userQuery($companyID: ID) {
        viewer {
            id
            name
            age
        }
    }
`;
