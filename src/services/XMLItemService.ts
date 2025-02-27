import { XMLItem } from '../models/XMLItem';
import { XMLData, XMLMapping } from '../types/xml';

export class XMLItemService {
  private items: XMLItem[] = [];
  private schema: XMLData['schema'] = [];
  private mappings: XMLMapping[] = [];

  constructor(data?: XMLData) {
    if (data) {
      this.loadData(data);
    }
  }

  public loadData(data: XMLData): void {
    this.items = data.items.map(item => new XMLItem(item));
    this.schema = data.schema;
    this.mappings = [];
  }

  public getItems(): XMLItem[] {
    return this.items;
  }

  public getSchema(): XMLData['schema'] {
    return this.schema;
  }

  public applyMappings(mappings: XMLMapping[]): void {
    this.mappings = mappings;
    
    // Apply mappings in order
    this.items.forEach(item => {
      mappings.forEach(mapping => {
        item.applyMapping(mapping);
      });
    });
  }

  public generateXML(): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">\n';
    xml += '  <channel>\n';
    
    this.items.forEach(item => {
      xml += '    <item>\n';
      const data = item.toObject();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          // Add single g: prefix to all keys
          xml += `      <${this.escapeXML(key)}>${this.escapeXML(value)}</${key}>\n`;
        }
      });
      xml += '    </item>\n';
    });
    
    xml += '  </channel>\n';
    xml += '</rss>';
    return xml;
  }

  private escapeXML(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  public toXMLData(): XMLData {
    return {
      items: this.items.map(item => item.toObject()),
      schema: this.schema
    };
  }
}