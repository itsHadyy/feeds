// Common types used across mapping components
export interface FieldOption {
  value: string;
  label: string;
  type?: 'internal' | 'input' | 'custom';
  sourceValue?: string; // The actual value from the XML file
}

export interface MappingType {
  value: string;
  label: string;
  description?: string;
}

export interface MappingState {
  mappingType: string;
  selectedField: string;
  selectedFields: FieldOption[];
  separator: string;
  isLocked: boolean;
}

export interface MappingActions {
  onFieldChange: (value: string) => void;
  onPreviewClick: () => void;
  onCommentClick: () => void;
  onABTestClick: () => void;
  onEditClick: () => void;
}

export interface MappingFieldProps extends MappingActions {
  fieldName: string;
  fieldValue: string;
  fieldOptions: FieldOption[];
  helpText?: string;
}