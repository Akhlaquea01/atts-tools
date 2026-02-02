import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as jsondiffpatch from 'jsondiffpatch';

@Component({
    selector: 'app-json-diff',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './json-diff.component.html',
    styleUrl: './json-diff.component.css'
})
export class JsonDiffComponent {
    leftJson = signal('');
    rightJson = signal('');
    diffResult = signal('');
    error = signal('');
    diffStats = signal({ added: 0, removed: 0, modified: 0 });

    private differ = jsondiffpatch.create({
        objectHash: function (obj: any) {
            return obj.id || obj._id || obj.name;
        },
        arrays: {
            detectMove: true,
            includeValueOnMove: false
        }
    });

    compareDiff() {
        this.error.set('');
        try {
            const left = JSON.parse(this.leftJson());
            const right = JSON.parse(this.rightJson());

            const delta = this.differ.diff(left, right);

            if (!delta) {
                this.diffResult.set('No differences found - objects are identical ✓');
                this.diffStats.set({ added: 0, removed: 0, modified: 0 });
                return;
            }

            const formatted = JSON.stringify(delta, null, 2);
            this.diffResult.set(formatted);
            this.calculateDiffStats(delta);

        } catch (e: any) {
            this.error.set('Error: ' + e.message);
        }
    }

    private calculateDiffStats(delta: any) {
        let added = 0, removed = 0, modified = 0;

        const traverse = (obj: any) => {
            for (const key in obj) {
                const value = obj[key];

                if (Array.isArray(value)) {
                    if (value.length === 1) {
                        added++;
                    } else if (value.length === 2) {
                        modified++;
                    } else if (value.length === 3 && value[2] === 0) {
                        removed++;
                    }
                } else if (typeof value === 'object' && value !== null) {
                    traverse(value);
                }
            }
        };

        traverse(delta);
        this.diffStats.set({ added, removed, modified });
    }

    applyPatch() {
        try {
            const left = JSON.parse(this.leftJson());
            const delta = JSON.parse(this.diffResult());

            const patched = this.differ.patch(left, delta);
            this.rightJson.set(JSON.stringify(patched, null, 2));

        } catch (e: any) {
            this.error.set('Error applying patch: ' + e.message);
        }
    }

    reversePatch() {
        try {
            const right = JSON.parse(this.rightJson());
            const delta = JSON.parse(this.diffResult());

            const unpatched = this.differ.unpatch(right, delta);
            this.leftJson.set(JSON.stringify(unpatched, null, 2));

        } catch (e: any) {
            this.error.set('Error reversing patch: ' + e.message);
        }
    }

    swapSides() {
        const temp = this.leftJson();
        this.leftJson.set(this.rightJson());
        this.rightJson.set(temp);
        this.diffResult.set('');
    }

    copyDiff() {
        if (this.diffResult()) {
            navigator.clipboard.writeText(this.diffResult());
        }
    }

    downloadDiff() {
        const blob = new Blob([this.diffResult()], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'diff-patch.json';
        a.click();
        URL.revokeObjectURL(url);
    }

    loadSample() {
        const sample1 = {
            "name": "John Doe",
            "age": 30,
            "email": "john@example.com",
            "hobbies": ["reading", "gaming"]
        };

        const sample2 = {
            "name": "John Doe",
            "age": 31,
            "email": "john.doe@example.com",
            "hobbies": ["reading", "gaming", "coding"],
            "city": "New York"
        };

        this.leftJson.set(JSON.stringify(sample1, null, 2));
        this.rightJson.set(JSON.stringify(sample2, null, 2));
    }

    clearAll() {
        this.leftJson.set('');
        this.rightJson.set('');
        this.diffResult.set('');
        this.error.set('');
    }
}
