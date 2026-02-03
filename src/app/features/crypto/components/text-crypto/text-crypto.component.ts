import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CryptoService } from '../../services/crypto.service';
import { HistoryService } from '../../../../core/services/history.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-text-crypto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tool-container">
      <header class="tool-header">
        <div>
          <h2>🔐 Text Encryption</h2>
          <p class="text-muted">Encrypt and decrypt text using AES-256-GCM with password protection</p>
        </div>
        <span class="privacy-badge">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
          </svg>
          Processing is local
        </span>
      </header>

      <div class="tool-body">
        <!-- Mode Selection -->
        <div class="mode-selector">
          <button
            class="mode-btn"
            [class.active]="mode() === 'encrypt'"
            (click)="mode.set('encrypt')"
          >
            Encrypt
          </button>
          <button
            class="mode-btn"
            [class.active]="mode() === 'decrypt'"
            (click)="mode.set('decrypt')"
          >
            Decrypt
          </button>
        </div>

        <!-- Encrypt Mode -->
        @if (mode() === 'encrypt') {
          <div class="form-section">
            <div class="form-group">
              <label for="plaintext">Text to Encrypt</label>
              <textarea
                id="plaintext"
                [(ngModel)]="plaintext"
                placeholder="Enter text to encrypt..."
                rows="8"
                class="w-full"
              ></textarea>
            </div>

            <div class="form-group">
              <label for="encrypt-password">Password</label>
              <div class="password-input-group">
                <input
                  id="encrypt-password"
                  [type]="showPassword() ? 'text' : 'password'"
                  [(ngModel)]="encryptPassword"
                  placeholder="Enter a strong password..."
                  class="w-full"
                />
                <button
                  type="button"
                  class="btn-icon"
                  (click)="togglePassword()"
                  [attr.aria-label]="showPassword() ? 'Hide password' : 'Show password'"
                >
                  @if (showPassword()) {
                    👁️
                  } @else {
                    🙈
                  }
                </button>
                <button
                  type="button"
                  class="btn btn-secondary"
                  (click)="generatePassword()"
                >
                  🎲 Generate
                </button>
              </div>
            </div>

            <button
              class="btn btn-primary w-full"
              (click)="encrypt()"
              [disabled]="!plaintext || !encryptPassword || encrypting()"
            >
              @if (encrypting()) {
                <span class="spinner"></span>
                Encrypting...
              } @else {
                🔒 Encrypt Text
              }
            </button>

            @if (encryptResult()) {
              <div class="result-section success">
                <h3>✅ Encryption Successful</h3>
                <div class="form-group">
                  <label>Encrypted Data (save this securely)</label>
                  <textarea
                    readonly
                    [value]="encryptResult()!"
                    rows="6"
                    class="w-full"
                  ></textarea>
                  <div class="flex gap-2 mt-1">
                    <button class="btn btn-secondary" (click)="copyToClipboard(encryptResult()!)">
                      📋 Copy Encrypted
                    </button>
                    <button class="btn btn-secondary" (click)="downloadEncrypted()">
                      💾 Download
                    </button>
                  </div>
                </div>
                <div class="info-box">
                  <strong>ℹ️ Important:</strong> Save this encrypted text securely. You'll need it along with your password to decrypt later. The salt and IV are already embedded - no need to save them separately!
                </div>
              </div>
            }
          </div>
        }

        <!-- Decrypt Mode -->
        @if (mode() === 'decrypt') {
          <div class="form-section">
            <div class="form-group">
              <label for="encrypted">Encrypted Data</label>
              <textarea
                id="encrypted"
                [(ngModel)]="encryptedData"
                placeholder="Paste encrypted data..."
                rows="4"
                class="w-full"
              ></textarea>
            </div>


            <div class="form-group">
              <label for="decrypt-password">Password</label>
              <div class="password-input-group">
                <input
                  id="decrypt-password"
                  [type]="showPassword() ? 'text' : 'password'"
                  [(ngModel)]="decryptPassword"
                  placeholder="Enter decryption password..."
                  class="w-full"
                />
                <button
                  type="button"
                  class="btn-icon"
                  (click)="togglePassword()"
                  [attr.aria-label]="showPassword() ? 'Hide password' : 'Show password'"
                >
                  @if (showPassword()) {
                    👁️
                  } @else {
                    🙈
                  }
                </button>
              </div>
            </div>

            <button
              class="btn btn-primary w-full"
              (click)="decrypt()"
              [disabled]="!encryptedData || !decryptPassword || decrypting()"
            >
              @if (decrypting()) {
                <span class="spinner"></span>
                Decrypting...
              } @else {
                🔓 Decrypt Text
              }
            </button>

            @if (decryptResult()) {
              <div class="result-section success">
                <h3>✅ Decryption Successful</h3>
                <div class="form-group">
                  <label>Decrypted Text</label>
                  <textarea
                    readonly
                    [value]="decryptResult()!"
                    rows="8"
                    class="w-full"
                  ></textarea>
                  <button class="btn btn-secondary mt-1" (click)="copyToClipboard(decryptResult()!)">
                    📋 Copy Decrypted
                  </button>
                </div>
              </div>
            }

            @if (decryptError()) {
              <div class="result-section error">
                <h3>❌ Decryption Failed</h3>
                <p>{{ decryptError() }}</p>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .tool-container {
      max-width: 800px;
      margin: 0 auto;
    }

    .tool-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
      gap: 1rem;
    }

    .tool-header h2 {
      margin-bottom: 0.5rem;
    }

    .privacy-badge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: var(--success-bg);
      color: var(--success-text);
      border-radius: 0.375rem;
      font-size: 0.875rem;
      font-weight: 500;
      white-space: nowrap;
    }

    .mode-selector {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 2rem;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 0.5rem;
      padding: 0.25rem;
    }

    .mode-btn {
      flex: 1;
      padding: 0.75rem;
      background: none;
      border: none;
      border-radius: 0.375rem;
      font-weight: 500;
      color: var(--text-secondary);
      transition: all 0.2s;
      cursor: pointer;
    }

    .mode-btn:hover {
      background: var(--hover);
      color: var(--text);
    }

    .mode-btn.active {
      background: var(--primary);
      color: white;
    }

    .form-section {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 0.5rem;
      padding: 2rem;
    }

    .password-input-group {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .password-input-group input {
      flex: 1;
    }

    .btn-icon {
      padding: 0.625rem;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 0.375rem;
      cursor: pointer;
      font-size: 1.25rem;
      transition: all 0.2s;
    }

    .btn-icon:hover {
      background: var(--hover);
    }

    .result-section {
      margin-top: 1.5rem;
      padding: 1.5rem;
      border-radius: 0.5rem;
    }

    .result-section.success {
      background: var(--success-bg);
      border: 1px solid var(--success-text);
    }

    .result-section.error {
      background: var(--danger-bg);
      border: 1px solid var(--danger-text);
      color: var(--danger-text);
    }

    .result-section h3 {
      margin-bottom: 1rem;
    }

    .metadata {
      margin-top: 1rem;
      padding: 1rem;
      background: rgba(255, 255, 255, 0.5);
      border-radius: 0.375rem;
      font-size: 0.875rem;
    }

    .metadata-item {
      margin-bottom: 0.5rem;
      word-break: break-all;
    }

    .metadata-item:last-child {
      margin-bottom: 0;
    }

    .spinner {
      display: inline-block;
      width: 1rem;
      height: 1rem;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .info-box {
      margin-top: 1rem;
      padding: 1rem;
      background: rgba(59, 130, 246, 0.1);
      border: 1px solid rgba(59, 130, 246, 0.3);
      border-radius: 0.375rem;
      font-size: 0.875rem;
      line-height: 1.5;
    }

    @media (max-width: 640px) {
      .tool-header {
        flex-direction: column;
      }

      .password-input-group {
        flex-wrap: wrap;
      }

      .password-input-group input {
        flex-basis: 100%;
      }
    }
  `]
})
export class TextCryptoComponent {
  private cryptoService = inject(CryptoService);
  private historyService = inject(HistoryService);
  private toastService = inject(ToastService);

  mode = signal<'encrypt' | 'decrypt'>('encrypt');
  showPassword = signal(false);

  // Encrypt form
  plaintext = '';
  encryptPassword = '';
  encrypting = signal(false);
  encryptResult = signal<string | null>(null);

  // Decrypt form
  encryptedData = '';
  decryptPassword = '';
  decrypting = signal(false);
  decryptResult = signal<string | null>(null);
  decryptError = signal<string | null>(null);

  // Flag to prevent duplicate copy operations
  private copying = false;

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  async encrypt(): Promise<void> {
    if (!this.plaintext || !this.encryptPassword) return;

    this.encrypting.set(true);
    this.encryptResult.set(null);

    try {
      const result = await this.cryptoService.encryptText(this.plaintext, this.encryptPassword);
      this.encryptResult.set(result);
      this.historyService.addEntry('Text Crypto', 'Encrypted text', `${this.plaintext.length} characters`);
    } catch (error) {
      console.error('Encryption error:', error);
      this.toastService.error('Encryption failed. Please try again.');
    } finally {
      this.encrypting.set(false);
    }
  }

  async decrypt(): Promise<void> {
    if (!this.encryptedData || !this.decryptPassword) return;

    this.decrypting.set(true);
    this.decryptResult.set(null);
    this.decryptError.set(null);

    try {
      const result = await this.cryptoService.decryptText(
        this.encryptedData,
        this.decryptPassword
      );
      this.decryptResult.set(result);
      this.historyService.addEntry('Text Crypto', 'Decrypted text', `${result.length} characters`);
    } catch (error: any) {
      this.decryptError.set(error.message || 'Decryption failed');
    } finally {
      this.decrypting.set(false);
    }
  }

  generatePassword(): void {
    const password = this.cryptoService.generatePassword(16, {
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true
    });
    this.encryptPassword = password;
  }

  async copyToClipboard(text: string): Promise<void> {
    // Validate input
    if (!text || !text.trim()) {
      this.toastService.error('Nothing to copy');
      return;
    }

    // Prevent duplicate calls
    if (this.copying) return;

    this.copying = true;
    try {
      await navigator.clipboard.writeText(text);
      this.toastService.success('Copied to clipboard!');
    } catch (error) {
      console.error('Copy failed:', error);
      this.toastService.error('Failed to copy to clipboard');
    } finally {
      // Reset flag after a short delay to allow rapid successive copies if needed
      setTimeout(() => this.copying = false, 500);
    }
  }

  downloadEncrypted(): void {
    const data = this.encryptResult();
    if (!data) return;

    const blob = new Blob([data], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'encrypted-text.json';
    a.click();
    URL.revokeObjectURL(url);
  }
}
