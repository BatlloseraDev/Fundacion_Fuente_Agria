export interface EditorContextType {
    editMode: boolean;
    setEditMode: (active: boolean) => void;
    saveAction: (() => Promise<void>) | null;
    setSaveAction: (action: (() => Promise<void>) | null) => void;
    isSaving: boolean;
    setIsSaving: (value: boolean) => void;
}