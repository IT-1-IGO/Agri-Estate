import React, { useState } from 'react';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import type { AddedSection, SectionItem } from '../cms/types';
import { BG_PRESETS, TEMPLATES, newSection, tplOf } from '../cms/sectionTemplates';
import { safeHref } from '../cms/renderSection';
import { uid } from './store';
import { Btn, Field, ImageField, Modal, inputCls } from './ui';

interface Props {
  initial?: AddedSection;
  initialHidden?: boolean;
  total: number;                 // sections currently on the page (for display order)
  initialPos?: number;
  onSave: (s: AddedSection, hidden: boolean, position: number) => void;
  onClose: () => void;
}

const Group: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <fieldset className="rounded-xl border border-[#E3E8E1] p-4"><legend className="px-2 text-sm font-semibold normal-case tracking-normal text-[#124B3B]">{title}</legend><div className="grid gap-4">{children}</div></fieldset>
);

/** Create or edit a main section of a page: details, layout, media, button, settings and its content items. */
const AddSectionModal: React.FC<Props> = ({ initial, initialHidden, total, initialPos, onSave, onClose }) => {
  const [s, setS] = useState<AddedSection>(() => initial ? JSON.parse(JSON.stringify(initial)) : { ...newSection('imageText'), id: uid() });
  const [hidden, setHidden] = useState(!!initialHidden);
  const maxPos = total + (initial ? 0 : 1);
  const [pos, setPos] = useState(initialPos ?? maxPos);
  const [err, setErr] = useState<Record<string, string>>({});
  const t = tplOf(s.template);
  const up = (patch: Partial<AddedSection>) => { setS((x) => ({ ...x, ...patch })); setErr({}); };

  const pickTemplate = (id: string) => {
    if (initial) return;
    const n = newSection(id);
    setS((x) => ({ ...n, id: x.id, name: x.name, label: x.label, heading: x.heading, subtitle: x.subtitle, description: x.description, image: x.image, bgImage: x.bgImage, alt: x.alt, btnText: x.btnText, btnLink: x.btnLink, btnVisible: x.btnVisible, status: x.status, items: x.items }));
  };
  const setItem = (id: string, patch: Partial<SectionItem>) => up({ items: s.items.map((i) => (i.id === id ? { ...i, ...patch } : i)) });
  const moveItem = (i: number, d: -1 | 1) => { const a = [...s.items]; const j = i + d; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; up({ items: a }); };

  const save = () => {
    const e: Record<string, string> = {};
    if (!s.name.trim()) e.name = 'Section name is required.';
    if (!s.heading.trim()) e.heading = 'Section heading is required.';
    if (t.button && s.btnText.trim() && !safeHref(s.btnLink)) e.btnLink = 'Enter a link starting with /, https://, mailto: or tel:.';
    if (Object.keys(e).length) { setErr(e); return; }
    const items = s.items.filter((i) => i.title.trim() || i.text.trim() || i.image).map((i) => ({ ...i, link: i.link?.trim() ? i.link.trim() : undefined }));
    onSave({ ...s, name: s.name.trim(), heading: s.heading.trim(), items }, hidden, Math.min(Math.max(1, pos), maxPos));
  };

  return (
    <Modal title={initial ? `Edit section — ${initial.name || initial.heading}` : 'Add New Section'} wide onClose={onClose}
      footer={<><Btn variant="outline" onClick={onClose}>Cancel</Btn><Btn onClick={save}>{initial ? 'Save section' : 'Add section'}</Btn></>}>
      <div className="grid gap-5">
        <p className="rounded-lg bg-[#F1F7EC] px-3 py-2 text-xs text-[#2B4139]">A new main section for this page only. It appears on the public page after you click Publish. Sections you add are separate from the cards inside existing sections.</p>

        <Group title="Section template">
          <div role="radiogroup" aria-label="Section template" className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {TEMPLATES.map((x) => (
              <button key={x.id} type="button" role="radio" aria-checked={x.id === s.template} disabled={!!initial && x.id !== s.template} onClick={() => pickTemplate(x.id)}
                className={`rounded-lg border p-3 text-left transition ${x.id === s.template ? 'border-[#124B3B] bg-[#EEF7F1] ring-1 ring-[#124B3B]' : 'border-[#E3E8E1] hover:border-[#9CC9AE]'} disabled:opacity-40`}>
                <span className="block text-sm font-semibold normal-case tracking-normal text-[#10231D]">{x.name}</span>
                <span className="mt-0.5 block text-xs normal-case tracking-normal text-[#5E726B]">{x.desc}</span>
              </button>))}
          </div>
          {initial && <p className="text-xs text-[#6B7F78]">The template cannot be changed after the section is created. Add a new section to use a different template.</p>}
        </Group>

        <Group title="Section basic details">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Section name *" htmlFor="as-name" error={err.name} hint="Internal name, shown in this editor."><input id="as-name" className={inputCls} value={s.name} onChange={(e) => up({ name: e.target.value })} autoFocus /></Field>
            <Field label="Section label" htmlFor="as-label" hint="Small text above the heading (optional)."><input id="as-label" className={inputCls} value={s.label} onChange={(e) => up({ label: e.target.value })} /></Field>
          </div>
          <Field label="Section heading *" htmlFor="as-head" error={err.heading}><input id="as-head" className={inputCls} value={s.heading} onChange={(e) => up({ heading: e.target.value })} /></Field>
          <Field label="Subtitle" htmlFor="as-sub"><input id="as-sub" className={inputCls} value={s.subtitle} onChange={(e) => up({ subtitle: e.target.value })} /></Field>
          <Field label="Description" htmlFor="as-desc"><textarea id="as-desc" rows={4} className={inputCls} value={s.description} onChange={(e) => up({ description: e.target.value })} /></Field>
        </Group>

        <Group title="Section layout">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Section type" htmlFor="as-type"><input id="as-type" className={`${inputCls} bg-[#F5F8F5]`} value={t.name} readOnly /></Field>
            <Field label="Layout" htmlFor="as-layout"><select id="as-layout" className={inputCls} value={s.layout} onChange={(e) => up({ layout: e.target.value })}>{t.layouts.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}</select></Field>
            {t.columns && <Field label="Number of columns" htmlFor="as-cols"><select id="as-cols" className={inputCls} value={s.columns} onChange={(e) => up({ columns: Number(e.target.value) })}>{[...t.columns].sort().map((c) => <option key={c} value={c}>{c} column{c > 1 ? 's' : ''}</option>)}</select></Field>}
            <Field label="Section alignment" htmlFor="as-align"><select id="as-align" className={inputCls} value={s.align} onChange={(e) => up({ align: e.target.value as AddedSection['align'] })}><option value="left">Left</option><option value="center">Centre</option><option value="right">Right</option></select></Field>
          </div>
          <div>
            <span className="mb-1.5 block text-sm font-medium normal-case tracking-normal">Colour scheme</span>
            <div className="flex flex-wrap gap-2">{BG_PRESETS.map((p) => (
              <button key={p.label} type="button" onClick={() => up({ bg: p.bg, color: p.color })} aria-pressed={s.bg.toLowerCase() === p.bg.toLowerCase() && s.color.toLowerCase() === p.color.toLowerCase()}
                className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs normal-case tracking-normal ${s.bg.toLowerCase() === p.bg.toLowerCase() && s.color.toLowerCase() === p.color.toLowerCase() ? 'border-[#124B3B] ring-1 ring-[#124B3B]' : 'border-[#C9D5CE]'}`}>
                <span className="h-5 w-5 rounded border border-black/10" style={{ background: p.bg }} />{p.label}</button>))}</div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Background colour" htmlFor="as-bg"><div className="flex gap-2"><input id="as-bg" type="color" className="h-10 w-14 rounded border border-[#C9D5CE] bg-white p-1" value={/^#[0-9a-f]{6}$/i.test(s.bg) ? s.bg : '#FFFFFF'} onChange={(e) => up({ bg: e.target.value })} /><input aria-label="Background colour code" className={inputCls} value={s.bg} onChange={(e) => up({ bg: e.target.value })} /></div></Field>
            <Field label="Text colour" htmlFor="as-fg"><div className="flex gap-2"><input id="as-fg" type="color" className="h-10 w-14 rounded border border-[#C9D5CE] bg-white p-1" value={/^#[0-9a-f]{6}$/i.test(s.color) ? s.color : '#10231D'} onChange={(e) => up({ color: e.target.value })} /><input aria-label="Text colour code" className={inputCls} value={s.color} onChange={(e) => up({ color: e.target.value })} /></div></Field>
          </div>
        </Group>

        {(t.image || t.bgImage) && (
          <Group title="Section media">
            {t.image && <div className="rounded-lg border border-[#E3E8E1] p-3"><ImageField label="Section image" value={s.image} onChange={(v) => up({ image: v })} /></div>}
            {t.bgImage && <div className="rounded-lg border border-[#E3E8E1] p-3"><ImageField label="Background image" value={s.bgImage} onChange={(v) => up({ bgImage: v })} /></div>}
            <Field label="Image alt text" htmlFor="as-alt" hint="Describes the section image for screen readers and search engines."><input id="as-alt" className={inputCls} value={s.alt} onChange={(e) => up({ alt: e.target.value })} /></Field>
          </Group>)}

        {t.item && (
          <Group title={`${t.item.plural} (${s.items.length})`}>
            {s.items.length === 0 && <p className="text-sm text-[#5E726B]">No {t.item.plural.toLowerCase()} yet. Add the first one below. Empty items are not shown on the website.</p>}
            {s.items.map((i, n) => (
              <div key={i.id} className="rounded-lg border border-[#E3E8E1] bg-[#FAFCFA] p-3">
                <div className="mb-2 flex items-center justify-between"><span className="text-xs font-semibold uppercase tracking-wide text-[#5E726B]">{t.item!.word} {n + 1}</span>
                  <span className="flex gap-1"><button type="button" aria-label={`Move ${t.item!.word.toLowerCase()} up`} disabled={n === 0} onClick={() => moveItem(n, -1)} className="rounded p-1 hover:bg-[#EEF3EF] disabled:opacity-30"><ArrowUp size={14} /></button>
                    <button type="button" aria-label={`Move ${t.item!.word.toLowerCase()} down`} disabled={n === s.items.length - 1} onClick={() => moveItem(n, 1)} className="rounded p-1 hover:bg-[#EEF3EF] disabled:opacity-30"><ArrowDown size={14} /></button>
                    <button type="button" aria-label={`Delete ${t.item!.word.toLowerCase()}`} onClick={() => up({ items: s.items.filter((x) => x.id !== i.id) })} className="rounded p-1 text-[#B42318] hover:bg-[#FDECEA]"><Trash2 size={14} /></button></span></div>
                <div className="grid gap-3">
                  <Field label={t.item!.title} htmlFor={`as-i${i.id}-t`}><input id={`as-i${i.id}-t`} className={inputCls} value={i.title} onChange={(e) => setItem(i.id, { title: e.target.value })} /></Field>
                  <Field label={t.item!.text} htmlFor={`as-i${i.id}-x`}><textarea id={`as-i${i.id}-x`} rows={2} className={inputCls} value={i.text} onChange={(e) => setItem(i.id, { text: e.target.value })} /></Field>
                  {t.item!.image && <div className="rounded-lg border border-[#E3E8E1] bg-white p-3"><ImageField label="Image" value={i.image || ''} onChange={(v) => setItem(i.id, { image: v })} /><div className="mt-3"><Field label="Image alt text"><input className={inputCls} value={i.alt || ''} onChange={(e) => setItem(i.id, { alt: e.target.value })} /></Field></div></div>}
                  {t.item!.link && <Field label="Link (optional)" htmlFor={`as-i${i.id}-l`}><input id={`as-i${i.id}-l`} className={inputCls} placeholder="/page, https://… or tel:+91…" value={i.link || ''} onChange={(e) => setItem(i.id, { link: e.target.value })} /></Field>}
                </div>
              </div>))}
            <div><Btn variant="outline" onClick={() => up({ items: [...s.items, { id: uid(), title: '', text: '' }] })}><Plus size={15} />Add {t.item.word.toLowerCase()}</Btn></div>
          </Group>)}

        {t.button && (
          <Group title="Section button">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Button text" htmlFor="as-bt"><input id="as-bt" className={inputCls} value={s.btnText} onChange={(e) => up({ btnText: e.target.value })} /></Field>
              <Field label="Button link" htmlFor="as-bl" error={err.btnLink}><input id="as-bl" className={inputCls} placeholder="/contact or https://…" value={s.btnLink} onChange={(e) => up({ btnLink: e.target.value })} /></Field>
            </div>
            <Field label="Button visibility" htmlFor="as-bv"><select id="as-bv" className={inputCls} value={s.btnVisible ? 'show' : 'hide'} onChange={(e) => up({ btnVisible: e.target.value === 'show' })}><option value="show">Show button</option><option value="hide">Hide button</option></select></Field>
          </Group>)}

        <Group title="Section settings">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Visibility" htmlFor="as-vis"><select id="as-vis" className={inputCls} value={hidden ? 'hidden' : 'visible'} onChange={(e) => setHidden(e.target.value === 'hidden')}><option value="visible">Visible</option><option value="hidden">Hidden</option></select></Field>
            <Field label="Section status" htmlFor="as-st" hint="Draft sections never appear publicly."><select id="as-st" className={inputCls} value={s.status} onChange={(e) => up({ status: e.target.value as AddedSection['status'] })}><option value="published">Published</option><option value="draft">Draft</option></select></Field>
            <Field label="Display order" htmlFor="as-pos" hint={`Position 1–${maxPos} on this page`}><input id="as-pos" type="number" min={1} max={maxPos} className={inputCls} value={pos} onChange={(e) => setPos(Number(e.target.value) || 1)} /></Field>
          </div>
        </Group>
      </div>
    </Modal>
  );
};
export default AddSectionModal;
