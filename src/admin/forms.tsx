import React from 'react';
import { Field, ImageField, inputCls } from './ui';

export interface FieldDef {
  key: string;
  label: string;
  type?: 'text' | 'textarea' | 'image' | 'select' | 'lines' | 'date';
  options?: string[];
  required?: boolean;
  hint?: string;
  placeholder?: string;
  max?: number;
}
export type Values = Record<string, unknown>;

export const validate = (fields: FieldDef[], v: Values): Record<string, string> => {
  const e: Record<string, string> = {};
  for (const f of fields) {
    const raw = v[f.key];
    const s = Array.isArray(raw) ? raw.join('\n') : String(raw ?? '');
    if (f.required && !s.trim()) e[f.key] = `${f.label} is required.`;
    else if (f.max && s.length > f.max) e[f.key] = `${f.label} must be ${f.max} characters or fewer.`;
  }
  return e;
};

export const FormFields: React.FC<{ fields: FieldDef[]; values: Values; errors?: Record<string, string>; onChange: (k: string, v: unknown) => void; idPrefix?: string }> = ({ fields, values, errors = {}, onChange, idPrefix = 'f' }) => (
  <div className="grid gap-4">
    {fields.map((f) => {
      const id = `${idPrefix}-${f.key}`;
      const val = values[f.key];
      if (f.type === 'image') {
        return <ImageField key={f.key} label={f.label} value={String(val ?? '')} onChange={(x) => onChange(f.key, x)} />;
      }
      return (
        <Field key={f.key} label={f.label + (f.required ? ' *' : '')} error={errors[f.key]} hint={f.hint} htmlFor={id}>
          {f.type === 'textarea' ? (
            <textarea id={id} rows={4} className={inputCls} placeholder={f.placeholder} value={String(val ?? '')} onChange={(e) => onChange(f.key, e.target.value)} />
          ) : f.type === 'lines' ? (
            <textarea id={id} rows={4} className={inputCls} placeholder={f.placeholder || 'One item per line'} value={Array.isArray(val) ? (val as string[]).join('\n') : String(val ?? '')} onChange={(e) => onChange(f.key, e.target.value.split('\n'))} />
          ) : f.type === 'select' ? (
            <select id={id} className={inputCls} value={String(val ?? '')} onChange={(e) => onChange(f.key, e.target.value)}>
              {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          ) : (
            <input id={id} type={f.type === 'date' ? 'date' : 'text'} className={inputCls} placeholder={f.placeholder} value={String(val ?? '')} onChange={(e) => onChange(f.key, e.target.value)} />
          )}
        </Field>
      );
    })}
  </div>
);

/** Clean values before saving: trim strings and drop empty lines. */
export const cleanValues = (fields: FieldDef[], v: Values): Values => {
  const out: Values = { ...v };
  for (const f of fields) {
    const raw = out[f.key];
    if (f.type === 'lines') out[f.key] = (Array.isArray(raw) ? raw : String(raw ?? '').split('\n')).map((x) => String(x).trim()).filter(Boolean);
    else if (typeof raw === 'string') out[f.key] = raw.trim();
  }
  return out;
};
