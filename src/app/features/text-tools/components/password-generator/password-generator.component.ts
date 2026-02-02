import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-password-generator',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="tool-container">
      <h2>🔒 Password Generator</h2>

      <div class="options-grid">
        <label>
          <span>Password Length: {{ length() }}</span>
          <input type="range" [(ngModel)]="length" min="4" max="64" class="slider">
        </label>

        <label class="checkbox-label">
          <input type="checkbox" [(ngModel)]="includeUppercase">
          <span>Uppercase (A-Z)</span>
        </label>

        <label class="checkbox-label">
          <input type="checkbox" [(ngModel)]="includeLowercase">
          <span>Lowercase (a-z)</span>
        </label>

        <label class="checkbox-label">
          <input type="checkbox" [(ngModel)]="includeNumbers">
          <span>Numbers (0-9)</span>
        </label>

        <label class="checkbox-label">
          <input type="checkbox" [(ngModel)]="includeSymbols">
          <span>Symbols (!@#$%)</span>
        </label>

        <label class="checkbox-label">
          <input type="checkbox" [(ngModel)]="excludeAmbiguous">
          <span>Exclude Ambiguous (0O1Il)</span>
        </label>
      </div>

      <div class="batch-control">
        <label>
          <span>Generate Count:</span>
          <input type="number" [(ngModel)]="batchCount" min="1" max="100" class="number-input">
        </label>
      </div>

      <div class="actions">
        <button (click)="generatePasswords()" class="btn-primary">🎲 Generate Passwords</button>
        <button (click)="generatePassphrase()" class="btn-secondary">📝 Generate Passphrase</button>
        <button (click)="copyAll()" class="btn-secondary" [disabled]="passwords().length === 0">📋 Copy All</button>
        <button (click)="passwords.set([])" class="btn-secondary">Clear</button>
      </div>

      @if (passwords().length > 0) {
        <div class="results">
          <h3>Generated Passwords ({{ passwords().length }})</h3>
          <div class="password-list">
            <div class="password-item" *ngFor="let pwd of passwords()">
              <div class="password-text">
                <code>{{ pwd.password }}</code>
                @if (pwd.strength !== null) {
                  <div class="strength-meter">
                    <div class="strength-bar"
                      [style.width.%]="(pwd.strength / 4) * 100"
                      [class]="'strength-' + getStrengthLabel(pwd.strength)">
                    </div>
                    <span class="strength-label">{{ getStrengthText(pwd.strength) }}</span>
                  </div>
                }
              </div>
              <button (click)="copy(pwd.password)" class="btn-copy">📋</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
    styles: [`
    .tool-container { max-width: 900px; margin: 0 auto; padding: 2rem; }
    h2 { margin-bottom: 1.5rem; }
    .options-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem;
      padding: 1.5rem; background: var(--surface); border-radius: 0.5rem; margin-bottom: 1rem; }
    .options-grid label { display: flex; flex-direction: column; gap: 0.5rem; }
    .checkbox-label { flex-direction: row !important; align-items: center; }
    .checkbox-label input[type="checkbox"] { width: 1.25rem; height: 1.25rem; margin-right: 0.5rem; }
    .slider { width: 100%; }
    .batch-control { margin-bottom: 1.5rem; }
    .batch-control label { display: flex; flex-direction: column; gap: 0.5rem; max-width: 200px; }
    .number-input { padding: 0.5rem; background: var(--background); border: 1px solid var(--border); border-radius: 0.25rem; }
    .actions { display: flex; gap: 0.75rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
    .btn-primary, .btn-secondary { padding: 0.625rem 1.25rem; border: none; border-radius: 0.25rem; cursor: pointer; }
    .btn-primary { background: var(--primary); color: white; }
    .btn-secondary { background: var(--surface); border: 1px solid var(--border); }
    .btn-secondary:disabled { opacity: 0.5; cursor: not-allowed; }
    .results { background: var(--surface); padding: 1.5rem; border-radius: 0.5rem; }
    .password-list { max-height: 400px; overflow-y: auto; margin-top: 1rem; }
    .password-item { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem;
      background: var(--background); border-radius: 0.25rem; margin-bottom: 0.5rem; gap: 1rem; }
    .password-text { flex: 1; min-width: 0; }
    .password-text code { font-family: 'Courier New', monospace; font-size: 1rem; word-break: break-all; }
    .strength-meter { margin-top: 0.5rem; display: flex; align-items: center; gap: 0.5rem; }
    .strength-bar { height: 6px; border-radius: 3px; transition: width 0.3s; }
    .strength-bar.strength-weak { background: #f44; }
    .strength-bar.strength-fair { background: #faa; }
    .strength-bar.strength-good { background: #fb0; }
    .strength-bar.strength-strong { background: #0c0; }
    .strength-label { font-size: 0.75rem; color: var(--text-secondary); }
    .btn-copy { padding: 0.375rem 0.625rem; background: var(--primary); color: white; border: none;
      border-radius: 0.25rem; cursor: pointer; white-space: nowrap; }
  `]
})
export class PasswordGeneratorComponent {
    length = signal(16);
    includeUppercase = signal(true);
    includeLowercase = signal(true);
    includeNumbers = signal(true);
    includeSymbols = signal(true);
    excludeAmbiguous = signal(false);
    batchCount = signal(5);
    passwords = signal<{ password: string; strength: number }[]>([]);

    generatePasswords() {
        const results: { password: string; strength: number }[] = [];
        for (let i = 0; i < this.batchCount(); i++) {
            const password = this.generatePassword();
            const strength = this.calculateStrength(password);
            results.push({ password, strength });
        }
        this.passwords.set(results);
    }

    private generatePassword(): string {
        let chars = '';
        if (this.includeUppercase()) chars += 'ABCDEFGHJKLMNPQRSTUVWXYZ';
        if (this.includeLowercase()) chars += 'abcdefghijkmnopqrstuvwxyz';
        if (this.includeNumbers()) chars += '23456789';
        if (this.includeSymbols()) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';

        if (this.excludeAmbiguous()) {
            chars = chars.replace(/[0O1Il]/g, '');
        } else {
            if (this.includeUppercase()) chars += 'OI';
            if (this.includeLowercase()) chars += 'l';
            if (this.includeNumbers()) chars += '01';
        }

        if (!chars) return '';

        const array = new Uint8Array(this.length());
        crypto.getRandomValues(array);

        return Array.from(array)
            .map(x => chars[x % chars.length])
            .join('');
    }

    generatePassphrase() {
        const words = ['correct', 'horse', 'battery', 'staple', 'dragon', 'umbrella', 'keyboard', 'mountain',
            'ocean', 'forest', 'thunder', 'crystal', 'rainbow', 'wizard', 'phoenix', 'galaxy', 'shadow', 'comet'];
        const wordCount = Math.floor(this.length() / 8) || 4;
        const selected: string[] = [];

        for (let i = 0; i < wordCount; i++) {
            const randomIndex = Math.floor(Math.random() * words.length);
            selected.push(words[randomIndex]);
        }

        const passphrase = selected.join('-');
        this.passwords.set([{ password: passphrase, strength: this.calculateStrength(passphrase) }]);
    }

    private calculateStrength(password: string): number {
        // Simple strength calculation (0-4)
        let score = 0;
        if (password.length >= 8) score++;
        if (password.length >= 12) score++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
        if (/\d/.test(password)) score++;
        if (/[^a-zA-Z0-9]/.test(password)) score++;
        return Math.min(score, 4);
    }

    getStrengthLabel(strength: number): string {
        const labels = ['weak', 'weak', 'fair', 'good', 'strong'];
        return labels[strength] || 'weak';
    }

    getStrengthText(strength: number): string {
        const texts = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
        return texts[strength] || 'Unknown';
    }

    copy(password: string) {
        navigator.clipboard.writeText(password);
    }

    copyAll() {
        const text = this.passwords().map(p => p.password).join('\n');
        navigator.clipboard.writeText(text);
    }
}
