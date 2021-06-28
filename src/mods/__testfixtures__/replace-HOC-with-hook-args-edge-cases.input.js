//@flow
import polyglotProvider from 'components/polyglotProvider';
import phrases from './MyComponent.phrases';

function MyComponent({ __, isCool = false, prefix: prefx }) {
    return (
        <div>
            {prefx} {isCool ? __('isCool') : __('notCool')}
        </div>
    );
}

export default polyglotProvider(phrases)(MyComponent);
