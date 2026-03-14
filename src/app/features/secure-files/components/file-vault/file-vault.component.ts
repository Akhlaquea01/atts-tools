import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CryptoService } from '../../../crypto/services/crypto.service';

// Extend window type for File System Access API
declare global {
    interface Window {
        showSaveFilePicker?: (opts?: any) => Promise<any>;
    }
}

@Component({
    selector: 'app-file-vault',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './file-vault.component.html',
    styleUrl: './file-vault.component.css'
})
export class FileVaultComponent {
    private cryptoService = inject(CryptoService);

    mode = signal<'encrypt' | 'decrypt'>('encrypt');

    // Encrypt mode
    selectedFile = signal<File | null>(null);
    password = '';
    confirmPassword = '';
    encrypting = signal(false);
    encryptProgress = signal(0);
    encryptDone = signal(false);

    // Decrypt mode
    encryptedFile = signal<File | null>(null);
    decryptPassword = '';
    decrypting = signal(false);
    decryptProgress = signal(0);
    decryptedFilename = signal('');
    decryptDone = signal(false);

    // Stats
    originalSize = signal(0);
    processedSize = signal(0);
    error = signal('');

    /** File System Access API supported? */
    get hasFSA(): boolean {
        return typeof window.showSaveFilePicker === 'function';
    }

    onFileSelect(event: any) {
        const file: File = event.target.files[0];
        if (file) {
            this.selectedFile.set(file);
            this.originalSize.set(file.size);
            this.error.set('');
            this.encryptDone.set(false);
            this.encryptProgress.set(0);
        }
    }

    onEncryptedFileSelect(event: any) {
        const file: File = event.target.files[0];
        if (file) {
            this.encryptedFile.set(file);
            this.originalSize.set(file.size);
            this.error.set('');
            this.decryptDone.set(false);
            this.decryptProgress.set(0);
            this.decryptedFilename.set('');
        }
    }

    async encryptFile() {
        const file = this.selectedFile();
        const pwd = this.password;
        const confirmPwd = this.confirmPassword;

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
        this.encryptProgress.set(0);
        this.encryptDone.set(false);
        this.error.set('');

        try {
            const outFilename = file.name + '.secure';
            const stream = this.cryptoService.encryptFileStream(
                file, pwd,
                (pct) => this.encryptProgress.set(Math.min(99, pct))
            );

            if (this.hasFSA) {
                // Stream directly to disk — no RAM buffering
                const handle = await window.showSaveFilePicker!({
                    suggestedName: outFilename,
                    types: [{ description: 'Secure File', accept: { 'application/octet-stream': ['.secure'] } }]
                });
                const writable = await handle.createWritable();
                let bytesWritten = 0;
                for await (const chunk of stream) {
                    await writable.write(chunk);
                    bytesWritten += chunk.byteLength;
                }
                await writable.close();
                this.processedSize.set(bytesWritten);
            } else {
                // Fallback: collect chunks then trigger download
                const chunks: BlobPart[] = [];
                let bytesWritten = 0;
                for await (const chunk of stream) {
                    chunks.push(chunk.buffer as ArrayBuffer);
                    bytesWritten += chunk.byteLength;
                }
                this.processedSize.set(bytesWritten);
                const blob = new Blob(chunks, { type: 'application/octet-stream' });
                this.downloadBlob(blob, outFilename);
            }

            this.encryptProgress.set(100);
            this.encryptDone.set(true);
        } catch (e: any) {
            if (e?.name !== 'AbortError') {
                this.error.set('Encryption failed: ' + (e?.message || String(e)));
            }
        } finally {
            this.encrypting.set(false);
        }
    }

    async decryptFile() {
        const file = this.encryptedFile();
        const pwd = this.decryptPassword;

        if (!file || !pwd) {
            this.error.set('Please select an encrypted file and enter the password');
            return;
        }

        this.decrypting.set(true);
        this.decryptProgress.set(0);
        this.decryptDone.set(false);
        this.error.set('');

        // We need the original filename — it's stored in the legacy format's JSON,
        // but our streaming format doesn't embed metadata. We'll use the file's own name
        // (strip the .secure extension) so the user knows what they will get.
        const guessedName = file.name.endsWith('.secure')
            ? file.name.slice(0, -7)
            : file.name + '.decrypted';

        try {
            const stream = this.cryptoService.decryptFileStream(
                file, pwd,
                (pct) => this.decryptProgress.set(Math.min(99, pct))
            );

            if (this.hasFSA) {
                const handle = await window.showSaveFilePicker!({
                    suggestedName: guessedName
                });
                const writable = await handle.createWritable();
                let bytesWritten = 0;
                for await (const chunk of stream) {
                    await writable.write(chunk);
                    bytesWritten += chunk.byteLength;
                }
                await writable.close();
                this.processedSize.set(bytesWritten);
            } else {
                const chunks: BlobPart[] = [];
                let bytesWritten = 0;
                for await (const chunk of stream) {
                    chunks.push(chunk.buffer as ArrayBuffer);
                    bytesWritten += chunk.byteLength;
                }
                this.processedSize.set(bytesWritten);
                const blob = new Blob(chunks);
                this.downloadBlob(blob, guessedName);
            }

            this.decryptProgress.set(100);
            this.decryptedFilename.set(guessedName);
            this.decryptDone.set(true);
        } catch (e: any) {
            if (e?.name !== 'AbortError') {
                this.error.set('Decryption failed: ' + (e?.message || 'Invalid password or corrupted file'));
            }
        } finally {
            this.decrypting.set(false);
        }
    }

    private downloadBlob(blob: Blob, filename: string) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    formatSize(bytes: number): string {
        if (bytes === 0) return '0 B';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
        return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    }

    clearEncrypt() {
        this.selectedFile.set(null);
        this.password = '';
        this.confirmPassword = '';
        this.encryptDone.set(false);
        this.encryptProgress.set(0);
        this.originalSize.set(0);
        this.processedSize.set(0);
        this.error.set('');
    }

    clearDecrypt() {
        this.encryptedFile.set(null);
        this.decryptPassword = '';
        this.decryptDone.set(false);
        this.decryptProgress.set(0);
        this.decryptedFilename.set('');
        this.originalSize.set(0);
        this.processedSize.set(0);
        this.error.set('');
    }
}
