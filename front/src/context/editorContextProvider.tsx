import { useState, use } from 'react';
import { useSearchParams } from 'react-router';
import { EditorContext } from './editorContext';
import { UserContext } from './userContext';

export function EditorContextProvider({ children }: { children: React.ReactNode }) {
    const [searchParams, setSearchParams] = useSearchParams();
    const { hasRole } = use(UserContext);
    
    // Aqui lee la URL y comprueba permisos de forma global
    const editMode = searchParams.get("edit") === "true" && hasRole(["EDITOR", "ADMIN"]);
    
    const [saveAction, setSaveAction] = useState<(() => Promise<void>) | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const setEditMode = (active: boolean) => {
        if (active) {
            setSearchParams({ edit: "true" });
        } else {
            setSearchParams({});
        }
    };

    return (
        <EditorContext.Provider value={{ editMode, setEditMode, saveAction, setSaveAction, isSaving, setIsSaving }}>
            {children}
        </EditorContext.Provider>
    );
}