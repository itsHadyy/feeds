import { useState, useCallback, useEffect } from 'react';
import { FieldOption } from '../types/mapping';

interface MappingFieldState {
  mappingType: string;
  selectedField: string;
  selectedFields: FieldOption[];
  separator: string;
  isLocked: boolean;
}

export const useMappingField = (initialValue: string, fieldName: string) => {
  // Load initial state from localStorage or use defaults
  const loadState = (): MappingFieldState => {
    const savedState = localStorage.getItem(`mappingFieldState-${fieldName}`);
    return savedState
      ? JSON.parse(savedState)
      : {
        mappingType: 'rename',
        selectedField: initialValue || '',
        selectedFields: [],
        separator: 'none',
        isLocked: fieldName === 'id', // Lock the id field by default
      };
  };

  const [state, setState] = useState<MappingFieldState>(loadState);
  const [dropdownState, setDropdownState] = useState({
    activeDropdown: null as string | null,
    isFieldDropdownOpen: false,
  });

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(`mappingFieldState-${fieldName}`, JSON.stringify(state));
  }, [state, fieldName]);

  const toggleDropdown = useCallback((dropdownName: string) => {
    if (state.isLocked) return;

    if (dropdownName === 'field') {
      setDropdownState((prev) => ({
        ...prev,
        isFieldDropdownOpen: !prev.isFieldDropdownOpen,
      }));
    } else {
      setDropdownState((prev) => ({
        ...prev,
        activeDropdown: prev.activeDropdown === dropdownName ? null : dropdownName,
      }));
    }
  }, [state.isLocked]);

  const handleMappingTypeChange = useCallback((type: string) => {
    if (state.isLocked) return;

    setState((prev: MappingFieldState) => ({
      ...prev,
      mappingType: type,
      selectedFields: type === 'combine' ? [] : prev.selectedFields,
      selectedField: type === 'combine' ? '' : prev.selectedField,
    }));

    setDropdownState((prev) => ({
      ...prev,
      activeDropdown: null,
    }));
  }, [state.isLocked]);

  const handleFieldSelect = useCallback((field: FieldOption, callback?: () => void) => {
    if (state.isLocked || !field) return;

    setState((prev: MappingFieldState) => {
      if (prev.mappingType === 'combine') {
        if (!prev.selectedFields.some((f) => f.value === field.value)) {
          return {
            ...prev,
            selectedFields: [...prev.selectedFields, field],
          };
        }
        return prev;
      }

      return {
        ...prev,
        selectedField: field.label || '',
      };
    });

    if (state.mappingType !== 'combine') {
      setDropdownState((prev) => ({
        ...prev,
        isFieldDropdownOpen: false,
      }));
    }

    if (callback) {
      callback();
    }
  }, [state.isLocked, state.mappingType]);

  const handleRemoveField = useCallback((value: string) => {
    if (state.isLocked) return;

    setState((prev: MappingFieldState) => ({
      ...prev,
      selectedFields: prev.selectedFields.filter((f) => f.value !== value),
    }));
  }, [state.isLocked]);

  const toggleLock = useCallback(() => {
    setState((prev: MappingFieldState) => ({
      ...prev,
      isLocked: !prev.isLocked,
    }));

    if (!state.isLocked) {
      setDropdownState({
        activeDropdown: null,
        isFieldDropdownOpen: false,
      });
    }
  }, [state.isLocked]);

  const setSeparator = useCallback((separator: string) => {
    if (state.isLocked) return;

    setState((prev: MappingFieldState) => ({
      ...prev,
      separator: separator || 'none',
    }));
  }, [state.isLocked]);

  return {
    state,
    dropdownState,
    setDropdownState,
    actions: {
      toggleDropdown,
      handleMappingTypeChange,
      handleFieldSelect,
      handleRemoveField,
      toggleLock,
      setSeparator,
    },
  };
};