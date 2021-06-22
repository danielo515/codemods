//@flow
import { usePolyglot } from 'components/polyglotProvider';
import phrases from './MyComponent.phrases';

function MyComponent({
    isCool = false
}) {
    const { __ } = usePolyglot(phrases);
    return isCool ? __('isCool') : __('notCool');
}

export default MyComponent;
