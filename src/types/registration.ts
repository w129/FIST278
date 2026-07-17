/** Registro de tokenización FIST278 — 100 formularios por área */

export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'select'
  | 'checkbox'
  | 'date'
  | 'email'
  | 'url';

export type FormFieldDef = {
  id: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: string[];
  help?: string;
};

export type RegistrationFormDef = {
  id: string;
  order: number;
  /** Área temática única */
  area: string;
  /** Función específica del formulario en el registro */
  function: string;
  title: string;
  description: string;
  fields: FormFieldDef[];
};

export type FormAnswers = Record<string, string | number | boolean>;

export type FormSubmission = {
  formId: string;
  completed: boolean;
  answers: FormAnswers;
  updatedAt: string;
};

export type RegistrationSession = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  submissions: Record<string, FormSubmission>;
  linkedTokenId?: string;
};
