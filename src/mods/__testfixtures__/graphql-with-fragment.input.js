// @flow
import { gql } from 'components/GraphQL';
import { COMPANY_FRAGMENT } from './fragments';

const COMPANY_VIEW_QUERY = gql`
    query companyViewQuery($companyID: ID) {
        viewer {
            id
            company(id: $companyID) {
                ...CompanyFragment
            }
        }
    }
    ${COMPANY_FRAGMENT}
`;

export default function Test() {
    const query = useQuery(COMPANY_VIEW_QUERY);
    return <div></div>;
}
