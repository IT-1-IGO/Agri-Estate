import React, { useEffect, useState } from 'react';
import { ExternalLink, RotateCcw } from 'lucide-react';
import { logActivity, useDoc } from './store';
import { Btn, Card, ConfirmDialog, PageHeader, useToast } from './ui';
import { FieldDef, FormFields, Values, cleanValues, validate } from './forms';

export interface Section { title: string; hint?: string; fields: FieldDef[] }
interface Props { name: string; title: string; crumbs?: string[]; sub?: string; sections: Section[]; previewPath?: string; notice?: string; extra?: React.ReactNode }

const DocEditor: React.FC<Props> = ({ name, title, crumbs, sub, sections, previewPath, notice, extra }) => {
  const { doc, saveDraft, publish } = useDoc(name);
  const toast = useToast();
  const all = sections.flatMap((s) => s.fields);
  const [values, setValues] = useState<Values>(() => ({ ...doc.published, ...doc.draft }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirm, setConfirm] = useState(false);
  const [dirty, setDirty] = useState(false);
  useEffect(() => { setValues({ ...doc.published, ...doc.draft }); setDirty(false); /* eslint-disable-next-line */ }, [name]);

  const same = JSON.stringify(cleanValues(all, values)) === JSON.stringify(cleanValues(all, { ...doc.published }));
  const state = !doc.publishedAt ? 'Not published yet' : same ? 'Published' : 'Unpublished changes';

  const run = (kind: 'draft' | 'publish') => {
    const e = kind === 'publish' ? validate(all, values) : {};
    setErrors(e);
    if (Object.keys(e).length) { toast('Please fix the highlighted fields.', 'err'); return; }
    const clean = cleanValues(all, values);
    try {
      if (kind === 'draft') saveDraft(clean); else publish(clean);
      setDirty(false);
      toast(kind === 'draft' ? 'Draft saved' : 'Published to the website');
      logActivity(kind === 'draft' ? 'Saved draft' : 'Published', title);
    } catch (err) { toast(err instanceof Error ? err.message : 'Could not save.', 'err'); }
  };

  return (
    <div>
      <PageHeader title={title} crumbs={crumbs} sub={sub}
        actions={<>
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${state === 'Published' ? 'bg-[#E3F3E8] text-[#17663A]' : 'bg-[#FFF1D6] text-[#8A5A00]'}`}>{state}</span>
          {previewPath && <a href={previewPath} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-[#C9D5CE] bg-white px-3.5 py-2 text-sm font-medium normal-case tracking-normal hover:bg-[#F2F6F3]"><ExternalLink size={15} />Preview</a>}
          <Btn variant="outline" onClick={() => setConfirm(true)} disabled={!dirty && !Object.keys(doc.draft || {}).length}><RotateCcw size={15} />Discard changes</Btn>
          <Btn variant="outline" onClick={() => run('draft')}>Save draft</Btn>
          <Btn onClick={() => run('publish')}>Publish</Btn>
        </>} />
      {notice && <p className="mb-4 rounded-lg border border-[#E6D9B8] bg-[#FFF8E6] px-4 py-2.5 text-sm text-[#6B5200]">{notice}</p>}
      <div className="grid gap-5">
        {sections.map((s) => (
          <Card key={s.title} className="p-5">
            <h2 className="text-base font-semibold normal-case tracking-normal text-[#10231D]">{s.title}</h2>
            {s.hint && <p className="mb-4 mt-0.5 text-sm text-[#5E726B]">{s.hint}</p>}
            {!s.hint && <div className="mb-3" />}
            <FormFields fields={s.fields} values={values} errors={errors} idPrefix={`doc-${name}`} onChange={(k, v) => { setValues((x) => ({ ...x, [k]: v })); setDirty(true); }} />
          </Card>
        ))}
        {extra}
      </div>
      {confirm && <ConfirmDialog title="Discard changes?" confirmLabel="Discard" text="Your unsaved and draft edits will be replaced with the last published version." onCancel={() => setConfirm(false)}
        onConfirm={() => { saveDraft({ ...doc.published }); setValues({ ...doc.published }); setDirty(false); setConfirm(false); toast('Changes discarded'); }} />}
    </div>
  );
};
export default DocEditor;
