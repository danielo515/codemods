// @flow
import { USER_QUERY } from './graphql';
import { RANDOM_FRAGMENT } from './more-fragments';

export default function Test() {
    const query = useQuery(USER_QUERY);
    return <div></div>;
}
