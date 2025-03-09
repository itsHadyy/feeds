import { XMLData, XMLMapping } from '../types/xml';
import { XMLItemService } from './XMLItemService';

export class XMLManager {
  private itemService: XMLItemService;

  constructor(initialData?: XMLData) {
    this.itemService = new XMLItemService(initialData);
  }

  public setData(data: XMLData): void {
    this.itemService = new XMLItemService(data);
  }

  public getData(): XMLData {
    return this.itemService.toXMLData();
  }

  public applyMappings(mappings: XMLMapping[]): XMLData {
    this.itemService.applyMappings(mappings);
    return this.getData();
  }

  public generateXML(items?: Record<string, string>[]): string {
    return this.itemService.generateXML();
  }

  public parseXMLString(xmlString: string): XMLData {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

    const parseError = xmlDoc.getElementsByTagName('parsererror');
    if (parseError.length > 0) {
      throw new Error('Invalid XML format');
    }

    const items = xmlDoc.getElementsByTagName('item');
    if (items.length === 0) {
      throw new Error('No items found in XML');
    }

    const schema = new Map<string, { required?: boolean; helpText?: string }>();
    const itemsData: Record<string, string>[] = [];

    Array.from(items).forEach((item) => {
      const itemData: Record<string, string> = {};
      Array.from(item.children).forEach((child) => {
        const nodeName = child.nodeName;
        if (!schema.has(nodeName)) {
          schema.set(nodeName, {
            required: child.hasAttribute('required'),
            helpText: child.getAttribute('description') || undefined,
          });
        }

        if (child.textContent) {
          itemData[nodeName] = child.textContent;
        }
      });
      itemsData.push(itemData);
    });

    const schemaArray = Array.from(schema.entries()).map(([name, props]) => ({
      name,
      ...props,
    }));

    return {
      items: itemsData,
      schema: schemaArray,
    };
  }

  public generateDownloadLink(xmlString: string = this.generateXML()): string {
    const blob = new Blob([xmlString], { type: 'text/xml' });
    return URL.createObjectURL(blob);
  }

  public downloadXML(xmlString: string = this.generateXML(), fileName: string = 'transformed.xml'): void {
    const blob = new Blob([xmlString], { type: 'text/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}