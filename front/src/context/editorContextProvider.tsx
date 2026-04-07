import { useState, type PropsWithChildren } from "react";
import { EditorContext } from "./editorContext";

export const EditorContextProvider = ({ children }: PropsWithChildren) => {
    const [modoEditor, setModoEditor] = useState(false);

    return (
        <EditorContext.Provider value={{
            modoEditor,
            setModoEditor
        }}>
            {children}
        </EditorContext.Provider>
    );
};