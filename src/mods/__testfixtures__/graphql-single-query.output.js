// @flow
import { USER_QUERY } from './graphql.js';

export default function Test() {
    const query = useQuery(USER_QUERY);
    return <div>{JSON.stringify(query)}</div>;
}