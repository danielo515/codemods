//@flow
import polyglotProvider from 'components/polyglotProvider';
import phrases from './MyComponent.phrases';

function MyComponent({ __, isCool = false }) {
    return isCool ? __('isCool') : __('notCool');
}

export default polyglotProvider(phrases)(MyComponent);
