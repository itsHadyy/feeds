import { XMLMapping } from '../types/xml';

export class XMLItem {
  private originalData: Record<string, string>;
  private mappedData: Record<string, string>;

  constructor(data: Record<string, string>) {
    this.originalData = { ...data };
    this.mappedData = { ...data };
  }

  public getValue(key: string, useOriginal: boolean = false): string {
    if (useOriginal) {
      // For custom values, use the value directly as the key
      if (key.startsWith('custom_')) {
        return key.replace('custom_', '');
      }
      return this.originalData[key] || '';
    }
    return this.mappedData[key] || '';
  }

  public setValue(key: string, value: string): void {
    this.mappedData[key] = value;
  }

  public getKeys(): string[] {
    return Object.keys(this.mappedData);
  }

  public toObject(): Record<string, string> {
    return { ...this.mappedData };
  }

  public resetMapping(key: string): void {
    if (this.originalData.hasOwnProperty(key)) {
      this.mappedData[key] = this.originalData[key];
    }
  }

  public applyMapping(mapping: XMLMapping): void {
    const targetField = mapping.targetField;

    // Reset the mapping for the target field before applying new mapping
    this.resetMapping(targetField);

    switch (mapping.type) {
      case 'rename':
        if (mapping.sourceField) {
          const sourceValue = this.getValue(mapping.sourceField, true);
          if (sourceValue !== undefined) {
            this.mappedData[targetField] = sourceValue;
          }
        }
        break;

      case 'static':
        if (mapping.value !== undefined) {
          this.mappedData[targetField] = mapping.value;
        }
        break;

      case 'combine':
        if (mapping.fields && mapping.fields.length > 0) {
          const values = mapping.fields.map(field => {
            // Handle both regular fields and custom values
            if (field.type === 'custom') {
              return field.value; // Use the value directly for custom fields
            }
            return this.getValue(field.value, true); // Use original values for regular fields
          }).filter(value => value !== undefined && value !== '');
          
          // Use empty string as default separator if none provided
          const separator = mapping.separator || '';
          if (values.length > 0) {
            this.mappedData[targetField] = values.join(separator);
          }
        }
        break;

      case 'empty':
        this.mappedData[targetField] = '';
        break;
    }
  }

  public getOriginalValue(key: string): string {
    return this.originalData[key] || '';
  }
}