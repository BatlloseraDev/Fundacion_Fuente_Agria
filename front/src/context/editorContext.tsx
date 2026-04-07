import { createContext } from "react";
import type { EditorContextType } from './types/editor.types';

export const EditorContext = createContext({} as EditorContextType);