import { Injectable } from '@angular/core';

/**
 * CryptoService handles all encryption/decryption operations
 * Uses Web Crypto API for AES-256-GCM encryption
 * PBKDF2 for key derivation from passwords
 *
 * SECURITY NOTES:
 * - All encryption happens client-side using browser Web Crypto API
 * - Never sends plaintext or encrypted data to any server
 * - Uses authenticated encryption (AES-GCM) to prevent tampering
 * - Random salt generated for each encryption operation
 * - 100,000 PBKDF2 iterations for key derivation
 */
@Injectable({
    providedIn: 'root'
})
export class CryptoService {
    private readonly PBKDF2_ITERATIONS = 100000;
    private readonly SALT_LENGTH = 16;  // 128 bits
    private readonly IV_LENGTH = 12;    // 96 bits for GCM
    private readonly KEY_LENGTH = 256;   // bits

    /**
     * Derive a cryptographic key from a password using PBKDF2
     */
    private async deriveKey(password: string, salt: Uint8Array<ArrayBuffer>): Promise<CryptoKey> {
        const encoder = new TextEncoder();
        const passwordBuffer = encoder.encode(password);

        // Import password as raw key material
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            passwordBuffer,
            { name: 'PBKDF2' },
            false,
            ['deriveBits', 'deriveKey']
        );

        // Derive AES-GCM key from password
        return crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt as Uint8Array<ArrayBuffer>,
                iterations: this.PBKDF2_ITERATIONS,
                hash: 'SHA-256'
            },
            keyMaterial,
            { name: 'AES-GCM', length: this.KEY_LENGTH },
            false,
            ['encrypt', 'decrypt']
        );
    }

    /**
     * Encrypt text using AES-256-GCM
     * Returns base64-encoded encrypted data and salt
     */
    async encryptText(plaintext: string, password: string): Promise<{ encrypted: string; salt: string; iv: string }> {
        const encoder = new TextEncoder();
        const data = encoder.encode(plaintext);

        // Generate random salt and IV
        const salt = crypto.getRandomValues(new Uint8Array(this.SALT_LENGTH)) as Uint8Array<ArrayBuffer>;
        const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH)) as Uint8Array<ArrayBuffer>;

        // Derive key from password
        const key = await this.deriveKey(password, salt);

        // Encrypt data
        const encryptedBuffer = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv: iv },
            key,
            data
        );

        // Convert to base64 for easy storage/transmission
        return {
            encrypted: this.arrayBufferToBase64(encryptedBuffer),
            salt: this.arrayBufferToBase64(salt.buffer),
            iv: this.arrayBufferToBase64(iv.buffer)
        };
    }

    /**
     * Decrypt text using AES-256-GCM
     */
    async decryptText(encryptedBase64: string, saltBase64: string, ivBase64: string, password: string): Promise<string> {
        try {
            // Convert from base64
            const encrypted = this.base64ToArrayBuffer(encryptedBase64);
            const salt = this.base64ToArrayBuffer(saltBase64);
            const iv = this.base64ToArrayBuffer(ivBase64);

            // Derive key from password
            const key = await this.deriveKey(password, new Uint8Array(salt));

            // Decrypt data
            const decryptedBuffer = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv: new Uint8Array(iv) },
                key,
                encrypted
            );

            // Convert back to text
            const decoder = new TextDecoder();
            return decoder.decode(decryptedBuffer);
        } catch (error) {
            throw new Error('Decryption failed. Invalid password or corrupted data.');
        }
    }

    /**
     * Encrypt a file using streaming approach for large files
     * Returns encrypted chunks that can be saved as .enc file
     */
    async* encryptFileStream(
        file: File,
        password: string,
        onProgress?: (percent: number) => void
    ): AsyncGenerator<Uint8Array> {
        const chunkSize = 64 * 1024 * 1024; // 64MB chunks
        const salt = crypto.getRandomValues(new Uint8Array(this.SALT_LENGTH));
        const key = await this.deriveKey(password, salt);

        // Yield metadata header (salt + file size)
        const header = new ArrayBuffer(this.SALT_LENGTH + 8);
        const headerView = new DataView(header);
        new Uint8Array(header, 0, this.SALT_LENGTH).set(salt);
        // Store file size as big-endian 64-bit integer
        const fileSize = file.size;
        headerView.setUint32(this.SALT_LENGTH, Math.floor(fileSize / 0x100000000), false);
        headerView.setUint32(this.SALT_LENGTH + 4, fileSize % 0x100000000, false);
        yield new Uint8Array(header);

        let offset = 0;
        while (offset < file.size) {
            const chunk = file.slice(offset, offset + chunkSize);
            const chunkData = await chunk.arrayBuffer();

            // Generate unique IV for each chunk
            const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));

            // Encrypt chunk
            const encryptedChunk = await crypto.subtle.encrypt(
                { name: 'AES-GCM', iv: iv },
                key,
                chunkData
            );

            // Yield IV + encrypted data length + encrypted data
            const chunkHeader = new ArrayBuffer(this.IV_LENGTH + 4);
            const chunkHeaderView = new DataView(chunkHeader);
            new Uint8Array(chunkHeader, 0, this.IV_LENGTH).set(iv);
            chunkHeaderView.setUint32(this.IV_LENGTH, encryptedChunk.byteLength, false);

            yield new Uint8Array(chunkHeader);
            yield new Uint8Array(encryptedChunk);

            offset += chunkSize;
            if (onProgress) {
                onProgress((offset / file.size) * 100);
            }
        }
    }

    /**
     * Decrypt a file using streaming approach
     */
    async* decryptFileStream(
        file: File,
        password: string,
        onProgress?: (percent: number) => void
    ): AsyncGenerator<Uint8Array> {
        const reader = file.stream().getReader();

        // Read header (salt + file size)
        const headerSize = this.SALT_LENGTH + 8;
        const headerBuffer = new Uint8Array(headerSize);
        let headerOffset = 0;

        while (headerOffset < headerSize) {
            const { value, done } = await reader.read();
            if (done) throw new Error('Unexpected end of file');
            headerBuffer.set(value.slice(0, headerSize - headerOffset), headerOffset);
            headerOffset += Math.min(value.length, headerSize - headerOffset);
        }

        const salt = headerBuffer.slice(0, this.SALT_LENGTH);
        const key = await this.deriveKey(password, salt);

        // Derive original file size from header
        const headerView = new DataView(headerBuffer.buffer);
        const fileSizeHigh = headerView.getUint32(this.SALT_LENGTH, false);
        const fileSizeLow = headerView.getUint32(this.SALT_LENGTH + 4, false);
        const totalSize = fileSizeHigh * 0x100000000 + fileSizeLow;

        let processedBytes = 0;
        let buffer = new Uint8Array(0);

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            // Append to buffer
            const newBuffer = new Uint8Array(buffer.length + value.length);
            newBuffer.set(buffer);
            newBuffer.set(value, buffer.length);
            buffer = newBuffer;

            // Process complete chunks
            while (buffer.length >= this.IV_LENGTH + 4) {
                const iv = buffer.slice(0, this.IV_LENGTH);
                const chunkLengthView = new DataView(buffer.buffer, buffer.byteOffset + this.IV_LENGTH, 4);
                const chunkLength = chunkLengthView.getUint32(0, false);

                const totalChunkSize = this.IV_LENGTH + 4 + chunkLength;
                if (buffer.length < totalChunkSize) break;

                const encryptedChunk = buffer.slice(this.IV_LENGTH + 4, totalChunkSize);

                try {
                    const decryptedChunk = await crypto.subtle.decrypt(
                        { name: 'AES-GCM', iv: iv },
                        key,
                        encryptedChunk
                    );

                    yield new Uint8Array(decryptedChunk);
                    processedBytes += decryptedChunk.byteLength;

                    if (onProgress && totalSize > 0) {
                        onProgress((processedBytes / totalSize) * 100);
                    }
                } catch (error) {
                    throw new Error('Decryption failed. Invalid password or corrupted file.');
                }

                buffer = buffer.slice(totalChunkSize);
            }
        }
    }

    /**
     * Utility: Convert ArrayBuffer to Base64 string
     */
    private arrayBufferToBase64(buffer: ArrayBuffer): string {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    /**
     * Utility: Convert Base64 string to ArrayBuffer
     */
    private base64ToArrayBuffer(base64: string): ArrayBuffer {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes.buffer;
    }

    /**
     * Generate a random password
     */
    generatePassword(length: number = 16, options: {
        includeUppercase?: boolean;
        includeLowercase?: boolean;
        includeNumbers?: boolean;
        includeSymbols?: boolean;
    } = {}): string {
        const {
            includeUppercase = true,
            includeLowercase = true,
            includeNumbers = true,
            includeSymbols = true
        } = options;

        let chars = '';
        if (includeUppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (includeLowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
        if (includeNumbers) chars += '0123456789';
        if (includeSymbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';

        if (chars.length === 0) chars = 'abcdefghijklmnopqrstuvwxyz';

        const randomValues = crypto.getRandomValues(new Uint8Array(length));
        let password = '';
        for (let i = 0; i < length; i++) {
            password += chars[randomValues[i] % chars.length];
        }
        return password;
    }
}
