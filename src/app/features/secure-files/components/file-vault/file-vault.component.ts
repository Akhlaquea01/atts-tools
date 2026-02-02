import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as CryptoJS from 'crypto-js';
import * as pako from 'pako';

interface FileMetadata {
    originalName: string;
    originalSize: number;
    compressed: boolean;
    timestamp: number;
}

@Component({
    selector: 'app-file-vault',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './file-vault.component.html',
    styleUrl: './file-vault.component.css'
})
export class FileVaultComponent {
    mode = signal<'encrypt' | 'decrypt'>('encrypt');

    // Encrypt mode
    selectedFile = signal<File | null>(null);
    password = signal('');
    confirmPassword = signal('');
    useCompression = signal(true);
    encrypting = signal(false);
    encryptedData = signal<Blob | null>(null);

    // Decrypt mode
    encryptedFile = signal<File | null>(null);
    decryptPassword = signal('');
    decrypting = signal(false);
    decryptedData = signal<Blob | null>(null);
    decryptedFilename = signal('');

    // Stats
    originalSize = signal(0);
    processedSize = signal(0);
    error = signal('');

    onFileSelect(event: any) {
        const file = event.target.files[0];
        if (file) {
            this.selectedFile.set(file);
            this.originalSize.set(file.size);
            this.error.set('');
        }
    }

    onEncryptedFileSelect(event: any) {
        const file = event.target.files[0];
        if (file) {
            this.encryptedFile.set(file);
            this.originalSize.set(file.size);
            this.error.set('');
        }
    }

    async encryptFile() {
        const file = this.selectedFile();
        const pwd = this.password();
        const confirmPwd = this.confirmPassword();

        if (!file || !pwd) {
            this.error.set('Please select a file and enter a password');
            return;
        }

        if (pwd !== confirmPwd) {
            this.error.set('Passwords do not match');
            return;
        }

        if (pwd.length < 6) {
            this.error.set('Password must be at least 6 characters');
            return;
        }

        this.encrypting.set(true);
        this.error.set('');

        try {
            // Read file as ArrayBuffer
            const arrayBuffer = await file.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);

            // Compress if enabled
            let dataToEncrypt = uint8Array;
            if (this.useCompression()) {
                dataToEncrypt = pako.gzip(uint8Array);
            }

            // Create metadata
            const metadata: FileMetadata = {
                originalName: file.name,
                originalSize: file.size,
                compressed: this.useCompression(),
                timestamp: Date.now()
            };

            // Convert data to base64 for encryption
            const dataBase64 = this.arrayBufferToBase64(dataToEncrypt);

            // Create payload with metadata and data
            const payload = JSON.stringify({
                metadata,
                data: dataBase64
            });

            // Encrypt the payload
            const encrypted = CryptoJS.AES.encrypt(payload, pwd).toString();

            // Convert to blob
            const blob = new Blob([encrypted], { type: 'application/octet-stream' });
            this.encryptedData.set(blob);
            this.processedSize.set(blob.size);

        } catch (e: any) {
            this.error.set('Encryption failed: ' + e.message);
        } finally {
            this.encrypting.set(false);
        }
    }

    async decryptFile() {
        const file = this.encryptedFile();
        const pwd = this.decryptPassword();

        if (!file || !pwd) {
            this.error.set('Please select an encrypted file and enter the password');
            return;
        }

        this.decrypting.set(true);
        this.error.set('');

        try {
            // Read encrypted file
            const text = await file.text();

            // Decrypt
            const decrypted = CryptoJS.AES.decrypt(text, pwd);
            const decryptedStr = decrypted.toString(CryptoJS.enc.Utf8);

            if (!decryptedStr) {
                throw new Error('Invalid password or corrupted file');
            }

            // Parse payload
            const payload = JSON.parse(decryptedStr);
            const metadata: FileMetadata = payload.metadata;
            const dataBase64: string = payload.data;

            // Convert base64 back to Uint8Array
            let uint8Array = this.base64ToArrayBuffer(dataBase64);

            // Decompress if needed
            if (metadata.compressed) {
                uint8Array = pako.ungzip(uint8Array);
            }

            // Create blob
            const blob = new Blob([new Uint8Array(uint8Array)]);
            this.decryptedData.set(blob);
            this.decryptedFilename.set(metadata.originalName);
            this.processedSize.set(blob.size);

        } catch (e: any) {
            this.error.set('Decryption failed: ' + (e.message || 'Invalid password'));
        } finally {
            this.decrypting.set(false);
        }
    }

    downloadEncrypted() {
        const blob = this.encryptedData();
        const filename = this.selectedFile()?.name || 'file';
        if (blob) {
            this.downloadBlob(blob, filename + '.secure');
        }
    }

    downloadDecrypted() {
        const blob = this.decryptedData();
        const filename = this.decryptedFilename();
        if (blob && filename) {
            this.downloadBlob(blob, filename);
        }
    }

    private downloadBlob(blob: Blob, filename: string) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    private arrayBufferToBase64(buffer: Uint8Array): string {
        let binary = '';
        const len = buffer.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(buffer[i]);
        }
        return btoa(binary);
    }

    private base64ToArrayBuffer(base64: string): Uint8Array {
        const binary = atob(base64);
        const len = binary.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes;
    }

    formatSize(bytes: number): string {
        if (bytes === 0) return '0 B';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
        return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    }

    getCompressionRatio(): number {
        if (this.originalSize() === 0) return 0;
        return Math.round(((this.originalSize() - this.processedSize()) / this.originalSize()) * 100);
    }

    clearEncrypt() {
        this.selectedFile.set(null);
        this.password.set('');
        this.confirmPassword.set('');
        this.encryptedData.set(null);
        this.originalSize.set(0);
        this.processedSize.set(0);
        this.error.set('');
    }

    clearDecrypt() {
        this.encryptedFile.set(null);
        this.decryptPassword.set('');
        this.decryptedData.set(null);
        this.decryptedFilename.set('');
        this.originalSize.set(0);
        this.processedSize.set(0);
        this.error.set('');
    }
}
