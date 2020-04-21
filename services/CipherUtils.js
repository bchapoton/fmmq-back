const forge = require('node-forge');

const generateCipherKeys = () => {
    return {
        key: forge.random.getBytesSync(16),
        iv: forge.random.getBytesSync(8)
    }
};

const decrypt = (data, key, iv) => {
    const cipher = forge.rc2.createDecryptionCipher(key);
    cipher.start(iv);
    cipher.update(data);
    cipher.finish();
    return cipher.output.toString();
};

const encrypt = (data, key, iv) => {
    const cipher = forge.rc2.createEncryptionCipher(key);
    cipher.start(iv);
    cipher.update(forge.util.createBuffer(data));
    cipher.finish();
    return cipher.output.toHex();
};

exports.generateCipherKeys = generateCipherKeys;
exports.decrypt = decrypt;
exports.encrypt = encrypt;