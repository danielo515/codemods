import { API } from 'jscodeshift';

export const failIfMissing = (value: any, missing_info: string, api: API) => {
    if (!value) {
        api.report(`You must provide ${missing_info}`);
        process.exit(1);
    }
};
