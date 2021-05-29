export const getFirstNode = (root) => root.find(j.Program).get('body', 0).node;
