export interface XMLItem {
  [key: string]: string;
}

export interface XMLData {
  items: XMLItem[];
  schema: {
    name: string;
    required?: boolean;
    helpText?: string;
  }[];
}

export interface XMLField {
  name: string;
  value: string;
  helpText?: string;
  required?: boolean;
}

export interface XMLMapping {
  targetField: string;
  type: 'rename' | 'static' | 'combine' | 'empty';
  sourceField?: string;
  value?: string;
  fields?: { value: string; label: string }[];
  separator?: string;
}