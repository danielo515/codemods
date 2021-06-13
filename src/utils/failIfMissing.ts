export const failIfMissing = (value, missing_info, api) => {
    if (!value) {
        api.report(`You must provide ${missing_info}`);
        process.exit(1);
    }
};
