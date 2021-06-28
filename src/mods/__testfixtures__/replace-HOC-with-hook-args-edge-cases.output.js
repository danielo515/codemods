//@flow
import { usePolyglot } from 'components/polyglotProvider';
import phrases from './MyComponent.phrases';

function MyComponent({
    isCool = false,
    prefix: prefx
}) {
    const { __ } = usePolyglot(phrases);
    return (
        <div>
            {prefx} {isCool ? __('isCool') : __('notCool')}
        </div>
    );
}

export default MyComponent;
