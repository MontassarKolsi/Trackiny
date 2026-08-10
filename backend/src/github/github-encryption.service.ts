import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class GithubEncryptionService {

    private readonly algorithm = 'aes-256-cbc';

    private readonly key = Buffer.from(
        process.env.GITHUB_ENCRYPTION_KEY!,
        'hex'
    );


    encrypt(text:string): string {

        const iv = crypto.randomBytes(16);

        const cipher = crypto.createCipheriv(
            this.algorithm,
            this.key,
            iv
        );

        const encrypted = Buffer.concat([
            cipher.update(text),
            cipher.final(),
        ]);


        return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
    }


    decrypt(data:string): string {

        const [ivHex, encryptedHex] = data.split(':');


        const decipher = crypto.createDecipheriv(
            this.algorithm,
            this.key,
            Buffer.from(ivHex,'hex')
        );


        const decrypted = Buffer.concat([
            decipher.update(Buffer.from(encryptedHex,'hex')),
            decipher.final(),
        ]);


        return decrypted.toString();
    }

}