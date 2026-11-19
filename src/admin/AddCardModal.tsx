import React, { useMemo, useState } from 'react';
import type { AddedCard, ScanGroup } from '../cms/types';
import { uid } from './store';
import { Btn, Field, ImageField, Modal, inputCls } from './ui';

interface Props {
  group: ScanGroup;
  word: string;                       // "Service", "Feature", "Project Card", "Item"…
  initial?: AddedCard;
  initialHidden?: boolean;
  total: number;                      // cards currently in the group (for the display-order field)
  initialPos?: number;
  canReorder: boolean;
  onSave: (card: AddedCard, hidden: boolean, position: number) => void;
  onClose: () => void;
}

/** Form for adding (or editing) a card that is a copy of an existing card's layout with its own content. */
const AddCardModal: React.FC<Props> = ({ group, word, initial, initialHidden, total, initialPos, canReorder, onSave, onClose }) => {
  const [tplKey, setTplKey] = useState(initial?.tpl || group.cards[0].key);
  const tpl = useMemo(() => group.cards.find((c) => c.key === tplKey) || group.cards[0], [group, tplKey]);
  const [texts, setTexts] = useState<Record<string, string>>(initial?.texts || {});
  const [img, setImg] = useState<AddedCard['img']>(initial?.img || {});
  const [link, setLink] = useState<Record<string, string>>(initial?.link || {});
  const [hidden, setHidden] = useState(!!initialHidden);
  const [pos, setPos] = useState(initialPos ?? total + 1);
  const [err, setErr] = useState('');
  const first = tpl.block.texts[0]?.key;

  const save = () => {
    if (first && !(texts[first] || '').trim()) { setErr(`Enter the ${word.toLowerCase()} title.`); return; }
    const clean = (o: Record<string, string>) => Object.fromEntries(Object.entries(o).filter(([, x]) => x !== ''));
    onSave({ id: initial?.id || uid(), tpl: tpl.key, texts: clean(texts), img: Object.fromEntries(Object.entries(img).filter(([, x]) => x.src || x.alt)), link: clean(link) }, hidden, Math.min(Math.max(1, pos), total + (initial ? 0 : 1)));
  };

  return (
    <Modal title={`${initial ? 'Edit' : 'Add'} ${word}`} onClose={onClose} wide
      footer={<><Btn variant="outline" onClick={onClose}>Cancel</Btn><Btn onClick={save}>{initial ? 'Save changes' : `Add ${word}`}</Btn></>}>
      <div className="grid gap-4">
        <p className="rounded-lg bg-[#F1F7EC] px-3 py-2 text-xs text-[#2B4139]">This {word.toLowerCase()} uses the same design as the others in this section. Fill in its own content below; it is saved as a draft until you click Publish.</p>
        {group.cards.length > 1 && (
          <Field label="Copy the layout of" htmlFor="ac-tpl">
            <select id="ac-tpl" className={inputCls} value={tplKey} onChange={(e) => { setTplKey(e.target.value); setTexts({}); setImg({}); setLink({}); }} disabled={!!initial}>
              {group.cards.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
          </Field>)}
        {tpl.block.texts.map((t, i) => {
          const long = t.value.length > 70;
          const label = i === 0 ? `${word} title *` : /^h[1-6]$/.test(t.tag) ? 'Heading' : t.tag === 'a' || t.tag === 'button' ? 'Button text' : 'Text';
          return (
            <Field key={t.key} label={label} htmlFor={`ac-t${i}`} error={i === 0 ? err : undefined}>
              {long ? <textarea id={`ac-t${i}`} rows={3} className={inputCls} placeholder={t.key} value={texts[t.key] || ''} onChange={(e) => { setErr(''); setTexts({ ...texts, [t.key]: e.target.value }); }} />
                : <input id={`ac-t${i}`} className={inputCls} placeholder={t.key} value={texts[t.key] || ''} onChange={(e) => { setErr(''); setTexts({ ...texts, [t.key]: e.target.value }); }} />}
            </Field>);
        })}
        {tpl.block.images.map((im) => (
          <div key={im.id} className="rounded-lg border border-[#E3E8E1] p-3">
            <ImageField label="Image" value={img[im.orig]?.src || ''} onChange={(src) => setImg({ ...img, [im.orig]: { ...img[im.orig], src } })} />
            <div className="mt-3"><Field label="Image description (alt text)"><input className={inputCls} value={img[im.orig]?.alt || ''} onChange={(e) => setImg({ ...img, [im.orig]: { ...img[im.orig], alt: e.target.value } })} /></Field></div>
            <p className="mt-2 text-xs text-[#6B7F78]">Leave empty to show no image on this card.</p>
          </div>))}
        {tpl.block.links.map((l, i) => (
          <Field key={l.id} label={`Link: ${l.label}`} htmlFor={`ac-l${i}`} hint="Leave empty for no link.">
            <input id={`ac-l${i}`} className={inputCls} placeholder="/page or https://…" value={link[l.orig] || ''} onChange={(e) => setLink({ ...link, [l.orig]: e.target.value })} />
          </Field>))}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Visibility" htmlFor="ac-vis"><select id="ac-vis" className={inputCls} value={hidden ? 'hidden' : 'visible'} onChange={(e) => setHidden(e.target.value === 'hidden')}><option value="visible">Visible</option><option value="hidden">Hidden</option></select></Field>
          {canReorder && <Field label="Display order" htmlFor="ac-pos" hint={`Position 1–${total + (initial ? 0 : 1)}`}><input id="ac-pos" type="number" min={1} max={total + (initial ? 0 : 1)} className={inputCls} value={pos} onChange={(e) => setPos(Number(e.target.value) || 1)} /></Field>}
        </div>
      </div>
    </Modal>
  );
};
export default AddCardModal;
