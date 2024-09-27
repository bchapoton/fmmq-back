import  forge from 'node-forge';

export const generateCipherKeys = () => {
    return {
        key: forge.random.getBytesSync(16),
        iv: forge.random.getBytesSync(8)
    }
};
