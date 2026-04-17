import { use } from 'react';
import { EditorContext } from '../../context/editorContext';

export function EditorBar() {
    const context = use(EditorContext);
    if (!context || !context.editMode) return null;

    const handleSave = async () => {
        if (context.saveAction) {
            context.setIsSaving(true);
            try {
                await context.saveAction();
                alert("¡Cambios guardados con éxito!");
                context.setEditMode(false);
            } catch (error) {
                console.error("Error al guardar:", error);
                alert("Error al guardar los cambios.");
            } finally {
                context.setIsSaving(false);
            }
        }
    };

    return (
        <div className="bg-dark text-white py-2 px-3 d-flex justify-content-between align-items-center sticky-top" style={{ zIndex: 1040 }}>
            <div>
                <i className="bi bi-pencil-square me-2"></i>
                <small className="fw-bold text-uppercase">Modo Edición Activado</small>
            </div>
            <div>
                <button 
                    className="btn btn-sm btn-success rounded-pill px-3 me-2" 
                    onClick={handleSave} 
                    disabled={!context.saveAction || context.isSaving}
                >
                    {context.isSaving ? "Guardando..." : "Guardar Cambios"}
                </button>
                <button 
                    className="btn btn-sm btn-outline-light rounded-pill px-3" 
                    onClick={() => context.setEditMode(false)}
                >
                    Salir
                </button>
            </div>
        </div>
    );
}