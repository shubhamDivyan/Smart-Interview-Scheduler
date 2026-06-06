const crypto=require("crypto");


const ALGORITHM='aes-256-cbc';
const ENCRYPTION_KEY=Buffer.from(process.env.ENCRYPTION_KEY || "", 'hex');
const IV_LENGTH=16;

function encrypt(text){
    if(!text)
        return null;

    const iv=crypto.randomBytes(IV_LENGTH);
    const cipher=crypto.createCipheriv(ALGORITHM,ENCRYPTION_KEY,iv);
    let encrypted=cipher.update(text,'utf-8');
    encrypted=Buffer.concat([encrypted,cipher.final()]);
    return iv.toString('hex')+':'+ encrypted.toString('hex');
}

function decrypt(text){
    if(!text)
        return null;

    const textParts=text.split(":");
    const iv=Buffer.from(textParts.shift(),'hex');
    const encryptedText=Buffer.from(textParts.join(':'),'hex');
    const decipher=crypto.createDecipheriv(ALGORITHM,ENCRYPTION_KEY,iv);
    const decrypted=decipher.update(encryptedText);
    decrypted=Buffer.concat([decrypted,decipher.final()]);
    return decrypted.toString('utf8');

}

module.exports={encrypt,decrypt}