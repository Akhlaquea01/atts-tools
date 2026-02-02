import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxGraphModule, Node as GraphNode, Edge as GraphEdge } from '@swimlane/ngx-graph';
import * as jsondiffpatch from 'jsondiffpatch';

export type ViewMode = 'split' | 'tree' | 'raw' | 'graph';
export type DiffType = 'added' | 'removed' | 'modified' | 'unchanged' | 'empty';

interface JsonNode {
    key: string;
    value: any;
    type: string;
    path: string;
    diffType?: DiffType;
    children?: JsonNode[];
    expanded?: boolean;
}

interface SearchResult {
    path: string;
    key: string;
    value: any;
    side: 'left' | 'right' | 'both';
}

@Component({
    selector: 'app-json-diff',
    standalone: true,
    imports: [CommonModule, FormsModule, NgxGraphModule],
    templateUrl: './json-diff.component.html',
    styleUrl: './json-diff.component.css'
})
export class JsonDiffComponent {
    // JSON Content
    leftJson = signal('');
    rightJson = signal('');

    // View State
    viewMode = signal<ViewMode>('split');
    showOnlyDifferences = signal(false);
    syncScroll = signal(true);

    // Search & Filter
    searchQuery = signal('');
    searchResults = signal<SearchResult[]>([]);
    currentSearchIndex = signal(0);

    // Diff Results
    diffResult = signal('');
    diffStats = signal({ added: 0, removed: 0, modified: 0, unchanged: 0 });
    leftTree = signal<JsonNode[]>([]);
    rightTree = signal<JsonNode[]>([]);

    // Graph State
    graphNodes = signal<GraphNode[]>([]);
    graphEdges = signal<GraphEdge[]>([]);

    // UI State
    error = signal('');
    leftValid = signal(true);
    rightValid = signal(true);
    selectedPath = signal('');
    copyFeedback = signal('');
    isEditing = signal(true); // Default to editing mode

    // Format Options
    indentSize = signal(2);
    sortKeys = signal(false);

    // Computed
    // Show results only if we have diff results AND we are NOT in edit mode
    hasResults = computed(() => this.diffResult() !== '' && !this.isEditing());
    hasSearch = computed(() => this.searchResults().length > 0);
    leftSize = computed(() => this.calculateSize(this.leftJson()));
    rightSize = computed(() => this.calculateSize(this.rightJson()));

    private differ = jsondiffpatch.create({
        objectHash: function (obj: any) {
            return obj.id || obj._id || obj.name;
        },
        arrays: {
            detectMove: true,
            includeValueOnMove: false
        }
    });

    // ==================== COMPARISON ====================

    compareJson() {
        this.error.set('');
        this.clearSearch();

        try {
            const left = this.parseJson(this.leftJson(), 'left');
            const right = this.parseJson(this.rightJson(), 'right');

            if (!left || !right) return;

            // Calculate diff
            const delta = this.differ.diff(left, right);

            if (!delta) {
                this.diffResult.set('✓ No differences found - objects are identical');
                this.diffStats.set({ added: 0, removed: 0, modified: 0, unchanged: this.countNodes(left) });
                this.leftTree.set(this.buildTree(left, []));
                this.rightTree.set(this.buildTree(right, []));
                this.isEditing.set(false); // Switch to View Mode
                return;
            }

            // Store diff result
            this.diffResult.set(JSON.stringify(delta, null, 2));

            // Calculate statistics
            this.calculateDiffStats(left, right, delta);

            // Build Trees & Visual Diffs
            const leftTree = this.buildTreeWithDiff(left, right, delta, 'left');
            this.leftTree.set(leftTree);
            this.rightTree.set(this.buildTreeWithDiff(left, right, delta, 'right'));
            this.computeVisualDiffs(left, right);

            // Compute Graph (visualize the left side structure with diffs)
            if (leftTree.length > 0) {
                // Wrap in a root node if it's a list, or take the first
                const root = leftTree.length === 1 ? leftTree[0] : { key: 'root', value: '', type: 'object', path: '', children: leftTree };
                this.computeGraph(root);
            }

            this.isEditing.set(false); // Switch to View Mode

            // Build tree views with diff highlighting
            this.leftTree.set(this.buildTreeWithDiff(left, right, delta, 'left'));
            this.rightTree.set(this.buildTreeWithDiff(left, right, delta, 'right'));

        } catch (e: any) {
            this.error.set('Error: ' + e.message);
        }
    }

    private parseJson(jsonStr: string, side: 'left' | 'right'): any {
        try {
            if (!jsonStr.trim()) {
                this.error.set(`${side} JSON is empty`);
                if (side === 'left') this.leftValid.set(false);
                else this.rightValid.set(false);
                return null;
            }

            const parsed = JSON.parse(jsonStr);
            if (side === 'left') this.leftValid.set(true);
            else this.rightValid.set(true);
            return parsed;

        } catch (e: any) {
            this.error.set(`Invalid ${side} JSON: ${e.message}`);
            if (side === 'left') this.leftValid.set(false);
            else this.rightValid.set(false);
            return null;
        }
    }

    private calculateDiffStats(left: any, right: any, delta: any) {
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

        const unchanged = this.countNodes(left) - (removed + modified);
        this.diffStats.set({ added, removed, modified, unchanged });
    }

    private countNodes(obj: any): number {
        let count = 0;

        const traverse = (o: any) => {
            if (typeof o === 'object' && o !== null) {
                for (const key in o) {
                    count++;
                    traverse(o[key]);
                }
            }
        };

        traverse(obj);
        return count;
    }

    // ==================== TREE BUILDING ====================

    private buildTree(obj: any, path: string[] = []): JsonNode[] {
        const nodes: JsonNode[] = [];

        if (typeof obj !== 'object' || obj === null) {
            return nodes;
        }

        for (const key in obj) {
            const value = obj[key];
            const currentPath = [...path, key];
            const pathStr = currentPath.join('.');

            const node: JsonNode = {
                key,
                value,
                type: this.getValueType(value),
                path: pathStr,
                diffType: 'unchanged',
                expanded: path.length < 2
            };

            if (typeof value === 'object' && value !== null) {
                node.children = this.buildTree(value, currentPath);
            }

            nodes.push(node);
        }

        return nodes;
    }

    private buildTreeWithDiff(left: any, right: any, delta: any, side: 'left' | 'right'): JsonNode[] {
        const nodes: JsonNode[] = [];
        const sourceObj = side === 'left' ? left : right;

        if (typeof sourceObj !== 'object' || sourceObj === null) {
            return nodes;
        }

        for (const key in sourceObj) {
            const value = sourceObj[key];
            const diffType = this.getDiffType(key, left, right, delta);

            const node: JsonNode = {
                key,
                value,
                type: this.getValueType(value),
                path: key,
                diffType,
                expanded: true
            };

            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                const leftChild = side === 'left' ? value : (left[key] || {});
                const rightChild = side === 'right' ? value : (right[key] || {});
                const deltChild = delta && delta[key] ? delta[key] : null;
                node.children = this.buildTreeWithDiff(leftChild, rightChild, deltChild, side);
            }

            nodes.push(node);
        }

        // Add removed keys for right side
        if (side === 'right' && delta) {
            for (const key in delta) {
                if (!(key in sourceObj) && Array.isArray(delta[key]) && delta[key].length === 3) {
                    nodes.push({
                        key,
                        value: delta[key][0],
                        type: this.getValueType(delta[key][0]),
                        path: key,
                        diffType: 'removed',
                        expanded: true
                    });
                }
            }
        }

        return nodes;
    }

    private getDiffType(key: string, left: any, right: any, delta: any): DiffType {
        if (!delta || !delta[key]) return 'unchanged';

        const diff = delta[key];

        if (Array.isArray(diff)) {
            if (diff.length === 1) return 'added';
            if (diff.length === 2) return 'modified';
            if (diff.length === 3 && diff[2] === 0) return 'removed';
        }

        return 'modified';
    }

    private getValueType(value: any): string {
        if (value === null) return 'null';
        if (Array.isArray(value)) return 'array';
        return typeof value;
    }

    // ==================== SEARCH ====================

    searchInJson() {
        const query = this.searchQuery().toLowerCase().trim();
        if (!query) {
            this.clearSearch();
            return;
        }

        const results: SearchResult[] = [];

        try {
            const left = this.leftValid() ? JSON.parse(this.leftJson()) : null;
            const right = this.rightValid() ? JSON.parse(this.rightJson()) : null;

            if (left) {
                this.searchObject(left, [], 'left', query, results);
            }

            if (right) {
                this.searchObject(right, [], 'right', query, results);
            }

            this.searchResults.set(results);
            this.currentSearchIndex.set(0);

        } catch (e) {
            // Ignore search errors
        }
    }

    private searchObject(obj: any, path: string[], side: 'left' | 'right', query: string, results: SearchResult[]) {
        if (typeof obj !== 'object' || obj === null) {
            return;
        }

        for (const key in obj) {
            const value = obj[key];
            const currentPath = [...path, key];
            const pathStr = currentPath.join('.');

            // Search in key
            if (key.toLowerCase().includes(query)) {
                results.push({ path: pathStr, key, value, side });
            }

            // Search in value
            if (typeof value === 'string' && value.toLowerCase().includes(query)) {
                results.push({ path: pathStr, key, value, side });
            } else if (typeof value === 'number' && value.toString().includes(query)) {
                results.push({ path: pathStr, key, value, side });
            }

            // Recurse
            if (typeof value === 'object' && value !== null) {
                this.searchObject(value, currentPath, side, query, results);
            }
        }
    }

    clearSearch() {
        this.searchQuery.set('');
        this.searchResults.set([]);
        this.currentSearchIndex.set(0);
    }

    nextSearchResult() {
        const results = this.searchResults();
        if (results.length === 0) return;

        const nextIndex = (this.currentSearchIndex() + 1) % results.length;
        this.currentSearchIndex.set(nextIndex);
        this.selectedPath.set(results[nextIndex].path);
    }

    previousSearchResult() {
        const results = this.searchResults();
        if (results.length === 0) return;

        const prevIndex = this.currentSearchIndex() === 0
            ? results.length - 1
            : this.currentSearchIndex() - 1;
        this.currentSearchIndex.set(prevIndex);
        this.selectedPath.set(results[prevIndex].path);
    }

    // ==================== COPY & DOWNLOAD ====================

    async copyLeft() {
        await this.copyToClipboard(this.leftJson(), 'Left JSON');
    }

    async copyRight() {
        await this.copyToClipboard(this.rightJson(), 'Right JSON');
    }

    async copyDiff() {
        await this.copyToClipboard(this.diffResult(), 'Diff result');
    }

    async copyBoth() {
        const both = {
            left: this.leftValid() ? JSON.parse(this.leftJson()) : this.leftJson(),
            right: this.rightValid() ? JSON.parse(this.rightJson()) : this.rightJson()
        };
        await this.copyToClipboard(JSON.stringify(both, null, 2), 'Both JSONs');
    }

    private async copyToClipboard(text: string, label: string) {
        try {
            await navigator.clipboard.writeText(text);
            this.copyFeedback.set(`✓ ${label} copied!`);
            setTimeout(() => this.copyFeedback.set(''), 2000);
        } catch (e) {
            this.error.set('Failed to copy to clipboard');
        }
    }

    downloadLeft() {
        this.downloadJson(this.leftJson(), 'left.json');
    }

    downloadRight() {
        this.downloadJson(this.rightJson(), 'right.json');
    }

    downloadDiff() {
        this.downloadJson(this.diffResult(), 'diff-patch.json');
    }

    downloadComparison() {
        const comparison = {
            left: this.leftValid() ? JSON.parse(this.leftJson()) : this.leftJson(),
            right: this.rightValid() ? JSON.parse(this.rightJson()) : this.rightJson(),
            diff: this.diffResult() ? JSON.parse(this.diffResult()) : null,
            stats: this.diffStats()
        };
        this.downloadJson(JSON.stringify(comparison, null, 2), 'comparison.json');
    }

    private downloadJson(content: string, filename: string) {
        const blob = new Blob([content], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    // ==================== FILE UPLOAD ====================

    onLeftFileSelect(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            this.loadFile(input.files[0], 'left');
        }
    }

    onRightFileSelect(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            this.loadFile(input.files[0], 'right');
        }
    }

    private loadFile(file: File, side: 'left' | 'right') {
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            if (side === 'left') {
                this.leftJson.set(content);
            } else {
                this.rightJson.set(content);
            }
            this.parseJson(content, side);
        };
        reader.readAsText(file);
    }

    // ==================== FORMATTING ====================

    formatLeft() {
        this.leftJson.set(this.formatJson(this.leftJson()));
    }

    formatRight() {
        this.rightJson.set(this.formatJson(this.rightJson()));
    }

    formatBoth() {
        this.formatLeft();
        this.formatRight();
    }

    private formatJson(jsonStr: string): string {
        try {
            const parsed = JSON.parse(jsonStr);
            const sorted = this.sortKeys() ? this.sortObjectKeys(parsed) : parsed;
            return JSON.stringify(sorted, null, this.indentSize());
        } catch (e) {
            return jsonStr;
        }
    }

    private sortObjectKeys(obj: any): any {
        if (typeof obj !== 'object' || obj === null) {
            return obj;
        }

        if (Array.isArray(obj)) {
            return obj.map(item => this.sortObjectKeys(item));
        }

        const sorted: any = {};
        Object.keys(obj).sort().forEach(key => {
            sorted[key] = this.sortObjectKeys(obj[key]);
        });
        return sorted;
    }

    minifyLeft() {
        this.leftJson.set(this.minifyJson(this.leftJson()));
    }

    minifyRight() {
        this.rightJson.set(this.minifyJson(this.rightJson()));
    }

    private minifyJson(jsonStr: string): string {
        try {
            const parsed = JSON.parse(jsonStr);
            return JSON.stringify(parsed);
        } catch (e) {
            return jsonStr;
        }
    }

    // ==================== UTILITY ====================

    swapSides() {
        const temp = this.leftJson();
        this.leftJson.set(this.rightJson());
        this.rightJson.set(temp);

        const tempValid = this.leftValid();
        this.leftValid.set(this.rightValid());
        this.rightValid.set(tempValid);

        this.diffResult.set('');
    }

    enterEditMode() {
        this.isEditing.set(true);
    }

    clearAll() {
        this.isEditing.set(true);
        this.leftJson.set('');
        this.rightJson.set('');
        this.diffResult.set('');
        this.error.set('');
        this.leftValid.set(true);
        this.rightValid.set(true);
        this.clearSearch();
    }

    loadSample() {
        const sample1 = {
            "name": "Apple",
            "color": "#FF0000",
            "details": {
                "type": "Pome",
                "season": "Fall"
            },
            "nutrients": {
                "calories": 52,
                "fiber": "2.4g",
                "vitaminC": "4.6mg"
            }
        };

        const sample2 = {
            "name": "Banana",
            "color": "#FFF700",
            "details": {
                "type": "Berry",
                "season": "Year-round"
            },
            "nutrients": {
                "calories": 89,
                "fiber": "2.6g",
                "potassium": "358mg"
            }
        };

        this.leftJson.set(JSON.stringify(sample1, null, 2));
        this.rightJson.set(JSON.stringify(sample2, null, 2));
        this.leftValid.set(true);
        this.rightValid.set(true);
    }

    private calculateSize(jsonStr: string): string {
        const bytes = new Blob([jsonStr]).size;
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    toggleViewMode(mode: ViewMode) {
        this.viewMode.set(mode);
    }

    toggleOnlyDifferences() {
        this.showOnlyDifferences.set(!this.showOnlyDifferences());
    }

    toggleSyncScroll() {
        this.syncScroll.set(!this.syncScroll());
    }

    // ==================== VISUAL LINE DIFF ====================

    leftDiffLines = signal<{ text: string, type: string, lineNum: number | null }[]>([]);
    rightDiffLines = signal<{ text: string, type: string, lineNum: number | null }[]>([]);

    private computeVisualDiffs(leftObj: any, rightObj: any) {
        // Format both to ensure consistent line comparison
        const leftStr = JSON.stringify(leftObj, null, 2);
        const rightStr = JSON.stringify(rightObj, null, 2);

        const leftLines = leftStr.split('\n');
        const rightLines = rightStr.split('\n');

        // Simple LCS-based Diff
        const matrix: number[][] = [];
        for (let i = 0; i <= leftLines.length; i++) {
            matrix[i] = new Array(rightLines.length + 1).fill(0);
        }

        for (let i = 1; i <= leftLines.length; i++) {
            for (let j = 1; j <= rightLines.length; j++) {
                if (leftLines[i - 1] === rightLines[j - 1]) {
                    matrix[i][j] = matrix[i - 1][j - 1] + 1;
                } else {
                    matrix[i][j] = Math.max(matrix[i - 1][j], matrix[i][j - 1]);
                }
            }
        }

        // Backtrack to find diff
        let i = leftLines.length;
        let j = rightLines.length;

        const leftResult = [];
        const rightResult = [];

        const commonLines: { left: number, right: number }[] = [];

        while (i > 0 && j > 0) {
            if (leftLines[i - 1] === rightLines[j - 1]) {
                commonLines.unshift({ left: i - 1, right: j - 1 });
                i--;
                j--;
            } else if (matrix[i - 1][j] > matrix[i][j - 1]) {
                i--;
            } else {
                j--;
            }
        }

        // Construct visual lines with padding for alignment
        let leftIndex = 0;
        let rightIndex = 0;

        for (const common of commonLines) {
            // Process deleted lines (in left but not right)
            while (leftIndex < common.left) {
                leftResult.push({ text: leftLines[leftIndex], type: 'removed', lineNum: leftIndex + 1 });
                rightResult.push({ text: '', type: 'empty', lineNum: null });
                leftIndex++;
            }

            // Process added lines (in right but not left)
            while (rightIndex < common.right) {
                leftResult.push({ text: '', type: 'empty', lineNum: null });
                rightResult.push({ text: rightLines[rightIndex], type: 'added', lineNum: rightIndex + 1 });
                rightIndex++;
            }

            // Process common line
            leftResult.push({ text: leftLines[leftIndex], type: 'unchanged', lineNum: leftIndex + 1 });
            rightResult.push({ text: rightLines[rightIndex], type: 'unchanged', lineNum: rightIndex + 1 });
            leftIndex++;
            rightIndex++;
        }

        // Remaining lines
        while (leftIndex < leftLines.length) {
            leftResult.push({ text: leftLines[leftIndex], type: 'removed', lineNum: leftIndex + 1 });
            rightResult.push({ text: '', type: 'empty', lineNum: null });
            leftIndex++;
        }

        while (rightIndex < rightLines.length) {
            leftResult.push({ text: '', type: 'empty', lineNum: null });
            rightResult.push({ text: rightLines[rightIndex], type: 'added', lineNum: rightIndex + 1 });
            rightIndex++;
        }

        this.leftDiffLines.set(leftResult);
        this.rightDiffLines.set(rightResult);
    }

    private computeGraph(rootNode: JsonNode) {
        const nodes: GraphNode[] = [];
        const edges: GraphEdge[] = [];
        let nodeIdCounter = 0;

        const traverse = (node: JsonNode, parentId?: string) => {
            const id = `node-${nodeIdCounter++}`;
            const label = node.key || 'root';

            // Create Node
            nodes.push({
                id,
                label,
                data: {
                    type: node.type,
                    value: node.value,
                    diffType: node.diffType,
                    key: node.key,
                    isObject: node.type === 'object' || node.type === 'array',
                    childCount: node.children ? node.children.length : 0
                }
            });

            // Create Edge from Parent
            if (parentId) {
                edges.push({
                    id: `edge-${parentId}-${id}`,
                    source: parentId,
                    target: id,
                    label: node.key
                });
            }

            // Recurse
            if (node.children) {
                node.children.forEach(child => traverse(child, id));
            }
        };

        traverse(rootNode);

        this.graphNodes.set(nodes);
        this.graphEdges.set(edges);
    }

    toggleNode(node: JsonNode) {
        node.expanded = !node.expanded;
    }
}

