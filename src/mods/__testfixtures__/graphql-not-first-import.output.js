// @flow
import { useQuery } from 'components/GraphQL';

import { USER_QUERY } from './graphql';

export default function Test() {
    const query = useQuery(USER_QUERY);
    return <div>{JSON.stringify(query)}</div>;
}
