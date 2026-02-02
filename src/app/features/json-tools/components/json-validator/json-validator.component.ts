import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-json-validator',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './json-validator.component.html',
    styleUrl: './json-validator.component.css'
})
export class JsonValidatorComponent {
    jsonInput = signal('');
    schemaInput = signal('');
    validationResult = signal('');
    isValid = signal(false);
    error = signal('');

    validateJson() {
        this.error.set('');
        this.validationResult.set('');

        try {
            // First validate that both inputs are valid JSON
            const jsonData = JSON.parse(this.jsonInput());

            if (!this.schemaInput()) {
                // Simple JSON syntax validation
                this.isValid.set(true);
                this.validationResult.set('✓ Valid JSON syntax');
                return;
            }

            const schema = JSON.parse(this.schemaInput());

            // Basic schema validation
            const result = this.simpleValidate(jsonData, schema);

            if (result.valid) {
                this.isValid.set(true);
                this.validationResult.set('✓ JSON is valid according to schema');
            } else {
                this.isValid.set(false);
                this.validationResult.set('✗ Validation errors:\n' + result.errors.join('\n'));
            }

        } catch (e: any) {
            this.error.set('Parse error: ' + e.message);
            this.isValid.set(false);
        }
    }

    private simpleValidate(data: any, schema: any, path: string = 'root'): { valid: boolean; errors: string[] } {
        const errors: string[] = [];

        // Type validation
        if (schema.type) {
            const actualType = Array.isArray(data) ? 'array' : typeof data;
            const expectedType = schema.type;

            if (actualType !== expectedType && !(actualType === 'number' && expectedType === 'integer')) {
                errors.push(`${path}: expected type '${expectedType}', got '${actualType}'`);
            }
        }

        // Required properties
        if (schema.required && typeof data === 'object' && !Array.isArray(data)) {
            for (const field of schema.required) {
                if (!(field in data)) {
                    errors.push(`${path}: missing required property '${field}'`);
                }
            }
        }

        // Properties validation
        if (schema.properties && typeof data === 'object' && !Array.isArray(data)) {
            for (const key in schema.properties) {
                if (key in data) {
                    const result = this.simpleValidate(data[key], schema.properties[key], `${path}.${key}`);
                    errors.push(...result.errors);
                }
            }
        }

        // String validations
        if (schema.type === 'string' && typeof data === 'string') {
            if (schema.minLength && data.length < schema.minLength) {
                errors.push(`${path}: string length ${data.length} is less than minimum ${schema.minLength}`);
            }
            if (schema.maxLength && data.length > schema.maxLength) {
                errors.push(`${path}: string length ${data.length} exceeds maximum ${schema.maxLength}`);
            }
            if (schema.pattern) {
                const regex = new RegExp(schema.pattern);
                if (!regex.test(data)) {
                    errors.push(`${path}: string does not match pattern ${schema.pattern}`);
                }
            }
        }

        // Number validations
        if ((schema.type === 'number' || schema.type === 'integer') && typeof data === 'number') {
            if (schema.minimum !== undefined && data < schema.minimum) {
                errors.push(`${path}: ${data} is less than minimum ${schema.minimum}`);
            }
            if (schema.maximum !== undefined && data > schema.maximum) {
                errors.push(`${path}: ${data} exceeds maximum ${schema.maximum}`);
            }
        }

        // Array validations
        if (schema.type === 'array' && Array.isArray(data)) {
            if (schema.minItems && data.length < schema.minItems) {
                errors.push(`${path}: array length ${data.length} is less than minimum ${schema.minItems}`);
            }
            if (schema.maxItems && data.length > schema.maxItems) {
                errors.push(`${path}: array length ${data.length} exceeds maximum ${schema.maxItems}`);
            }
            if (schema.items) {
                data.forEach((item, index) => {
                    const result = this.simpleValidate(item, schema.items, `${path}[${index}]`);
                    errors.push(...result.errors);
                });
            }
        }

        return { valid: errors.length === 0, errors };
    }

    generateSchema() {
        try {
            const data = JSON.parse(this.jsonInput());
            const schema = this.inferSchema(data);
            this.schemaInput.set(JSON.stringify(schema, null, 2));
        } catch (e: any) {
            this.error.set('Error generating schema: ' + e.message);
        }
    }

    private inferSchema(data: any): any {
        if (Array.isArray(data)) {
            const schema: any = { type: 'array' };
            if (data.length > 0) {
                schema.items = this.inferSchema(data[0]);
            }
            return schema;
        } else if (data === null) {
            return { type: 'null' };
        } else if (typeof data === 'object') {
            const schema: any = {
                type: 'object',
                properties: {},
                required: Object.keys(data)
            };

            for (const key in data) {
                schema.properties[key] = this.inferSchema(data[key]);
            }

            return schema;
        } else {
            return { type: typeof data };
        }
    }

    loadTemplate(template: string) {
        const templates: { [key: string]: any } = {
            user: {
                type: 'object',
                required: ['id', 'name', 'email'],
                properties: {
                    id: { type: 'number' },
                    name: { type: 'string', minLength: 1 },
                    email: { type: 'string', pattern: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$' },
                    age: { type: 'number', minimum: 0, maximum: 150 }
                }
            },
            config: {
                type: 'object',
                required: ['version', 'settings'],
                properties: {
                    version: { type: 'string' },
                    settings: {
                        type: 'object',
                        properties: {
                            debug: { type: 'boolean' },
                            port: { type: 'number' }
                        }
                    }
                }
            }
        };

        if (templates[template]) {
            this.schemaInput.set(JSON.stringify(templates[template], null, 2));
        }
    }

    loadSampleJson() {
        const sample = {
            id: 1,
            name: "John Doe",
            email: "john@example.com",
            age: 30
        };
        this.jsonInput.set(JSON.stringify(sample, null, 2));
    }

    clearAll() {
        this.jsonInput.set('');
        this.schemaInput.set('');
        this.validationResult.set('');
        this.error.set('');
    }
}
