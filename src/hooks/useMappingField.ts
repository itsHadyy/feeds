import { useState, useCallback } from 'react';
import { FieldOption } from '../types/mapping';

export const useMappingField = (initialValue: string, fieldName: string) => {
  const [state, setState] = useState({
    mappingType: 'rename',
    selectedField: initialValue || '',
    selectedFields: [] as FieldOption[],
    separator: 'none',
    isLocked: fieldName === 'id', // Lock the id field by default
  });

  const [dropdownState, setDropdownState] = useState({
    activeDropdown: null as string | null,
    isFieldDropdownOpen: false,
  });

  const toggleDropdown = useCallback((dropdownName: string) => {
    if (state.isLocked) return;
    
    if (dropdownName === 'field') {
      setDropdownState(prev => ({
        ...prev,
        isFieldDropdownOpen: !prev.isFieldDropdownOpen,
      }));
    } else {
      setDropdownState(prev => ({
        ...prev,
        activeDropdown: prev.activeDropdown === dropdownName ? null : dropdownName,
      }));
    }
  }, [state.isLocked]);

  const handleMappingTypeChange = useCallback((type: string) => {
    if (state.isLocked) return;
    
    setState(prev => ({
      ...prev,
      mappingType: type,
      selectedFields: type === 'combine' ? [] : prev.selectedFields,
      selectedField: type === 'combine' ? '' : prev.selectedField,
    }));
    
    setDropdownState(prev => ({
      ...prev,
      activeDropdown: null,
    }));
  }, [state.isLocked]);

  const handleFieldSelect = useCallback((field: FieldOption, callback?: () => void) => {
    if (state.isLocked || !field) return;

    setState(prev => {
      if (prev.mappingType === 'combine') {
        if (!prev.selectedFields.some(f => f.value === field.value)) {
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
      setDropdownState(prev => ({
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
    
    setState(prev => ({
      ...prev,
      selectedFields: prev.selectedFields.filter(f => f.value !== value),
    }));
  }, [state.isLocked]);

  const toggleLock = useCallback(() => {
    setState(prev => ({
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
    
    setState(prev => ({
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