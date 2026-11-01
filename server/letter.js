// Letterhead export: draft text -> PDF (WeasyPrint: harfbuzz shaping, Gujarati/Devanagari conjuncts sahi) aur DOCX.
import { spawn, execFile } from 'node:child_process';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { parseMd } from '../client/src/md.js';
import { Document, Packer, Paragraph, TextRun, ImageRun, Header, AlignmentType, BorderStyle, HorizontalPositionRelativeFrom, VerticalPositionRelativeFrom, TextWrappingType } from 'docx';

export const DEFAULT_ORG = { name: 'Mira Road Sthanik Panchayat-28', sub: 'Shree Sant Shiromani Rohidas Vanshi Vadhiyara Chamar Samaj', address: 'Mira Road, Thane, Maharashtra', contact: '' };
const IMG_RE = /^data:image\/(png|jpeg);base64,[A-Za-z0-9+/=]+$/;
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clip = (s, n) => String(s ?? '').slice(0, n);
export function cleanInput(b = {}) {
  const org = { ...DEFAULT_ORG };
  for (const k of Object.keys(DEFAULT_ORG)) if (typeof b.org?.[k] === 'string') org[k] = clip(b.org[k], 200);
  const num = (v, d, lo, hi) => Math.min(hi, Math.max(lo, Number.isFinite(+v) && v !== '' && v != null ? +v : d));
  const img = typeof b.letterheadImage === 'string' && b.letterheadImage.length < 8e6 && IMG_RE.test(b.letterheadImage) ? b.letterheadImage : null;
  return { text: clip(b.text, 20000), org, img, lang: ['gu', 'mr', 'hi', 'en'].includes(b.lang) ? b.lang : 'hi',
    top: num(b.marginTop, img ? 45 : 18, 5, 120), bottom: num(b.marginBottom, img ? 30 : 20, 5, 100) };
}

const inl = nodes => nodes.map(n => n.t === 'b' ? `<b>${esc(n.v)}</b>` : n.t === 'i' ? `<i>${esc(n.v)}</i>` : `<span>${esc(n.v)}</span>`).join('');
export function bodyHtml(text) {
  return parseMd(text).map(b => b.t === 'ul' ? `<ul>${b.items.map(i => `<li>${inl(i)}</li>`).join('')}</ul>`
    : b.t === 'ol' ? `<ol>${b.items.map(i => `<li>${inl(i)}</li>`).join('')}</ol>`
    : b.t === 'h' ? `<p class="h">${inl(b.v)}</p>` : b.t === 'hr' ? '' : b.t === 'br' ? '<div class="sp"></div>' : `<p>${inl(b.v)}</p>`).join('\n');
}
export function buildHtml(inp) {
  const { org, img, text, lang, top, bottom } = inp;
  const fam = lang === 'gu' ? "'Noto Sans Gujarati','Noto Sans Devanagari','Noto Sans'" : lang === 'en' ? "'Noto Sans','Noto Sans Devanagari','Noto Sans Gujarati'" : "'Noto Sans Devanagari','Noto Sans Gujarati','Noto Sans'";
  const head = img ? `<div class="bg" style="background-image:url(${img})"></div>` : `<div class="lh"><div class="n">${esc(org.name)}</div>${org.sub ? `<div class="s">${esc(org.sub)}</div>` : ''}<div class="a">${esc([org.address, org.contact].filter(Boolean).join('  |  '))}</div></div>`;
  return `<!doctype html><html lang="${lang === 'en' ? 'en' : lang}"><head><meta charset="utf-8"><style>
@page { size: A4; margin: ${top}mm 18mm ${bottom}mm 18mm; ${img ? '' : `@bottom-center { content: "${esc(org.name).replace(/"/g, '')}"; font: 8pt ${fam}; color: #777; }`} }
html { font-family: ${fam}, sans-serif; font-size: 11.5pt; line-height: 1.65; color: #111; }
p { margin: 0 0 1.5pt; } .h { font-weight: 700; margin-top: 6pt; } .sp { height: 8pt; } ul, ol { margin: 2pt 0 4pt 0; padding-left: 20pt; } li { margin: 0 0 2pt; }
.bg { background-repeat: no-repeat; background-size: 210mm 297mm; position: fixed; top: -${top}mm; left: -18mm; width: 210mm; height: 297mm; z-index: -1; }
.lh { text-align: center; border-bottom: 2.5pt double #1f3a8a; padding-bottom: 6pt; margin-bottom: 14pt; }
.lh .n { font-size: 19pt; font-weight: 700; color: #1f3a8a; line-height: 1.35; } .lh .s { font-size: 10.5pt; color: #333; } .lh .a { font-size: 9.5pt; color: #555; margin-top: 2pt; }
</style></head><body>${head}${bodyHtml(text)}</body></html>`;
}

const BIN = () => process.env.WEASYPRINT_BIN || 'weasyprint';
export function makePdf(inp) {
  return new Promise((resolve, reject) => {
    const p = spawn(BIN(), ['-q', '-', '-'], { stdio: ['pipe', 'pipe', 'pipe'] });
    const out = [], err = []; const t = setTimeout(() => { p.kill('SIGKILL'); reject(new Error('PDF timeout')); }, 45000);
    p.stdout.on('data', d => out.push(d)); p.stderr.on('data', d => err.push(d));
    p.on('error', e => { clearTimeout(t); reject(e); });
    p.on('close', c => { clearTimeout(t); c === 0 && out.length ? resolve(Buffer.concat(out)) : reject(new Error('PDF fail: ' + Buffer.concat(err).toString().slice(0, 200))); });
    p.stdin.end(buildHtml(inp));
  });
}

// ---- DOCX ----
const CS = { gu: 'Nirmala UI', mr: 'Nirmala UI', hi: 'Nirmala UI', en: 'Calibri' };
export async function makeDocx(inp) {
  const { org, img, text, lang, top, bottom } = inp;
  const mm = v => Math.round(v * 56.7); // twips
  const font = { ascii: 'Calibri', hAnsi: 'Calibri', cs: CS[lang], eastAsia: CS[lang] };
  const run = (t, o = {}) => new TextRun({ text: t, font, size: 23, sizeComplexScript: 23, ...o, boldComplexScript: o.bold, italicsComplexScript: o.italics });
  const runs = nodes => nodes.map(n => run(n.v, { bold: n.t === 'b', italics: n.t === 'i' }));
  const body = [];
  for (const b of parseMd(text)) {
    if (b.t === 'ul' || b.t === 'ol') b.items.forEach((it, i) => body.push(new Paragraph({ children: [run(b.t === 'ul' ? '•  ' : `${i + 1}.  `), ...runs(it)], indent: { left: 400, hanging: 300 }, spacing: { after: 40 } })));
    else if (b.t === 'h') body.push(new Paragraph({ children: runs(b.v).map(r => r), spacing: { before: 120, after: 40 } }));
    else if (b.t === 'br') body.push(new Paragraph({ children: [run('')], spacing: { after: 80 } }));
    else if (b.t === 'p') body.push(new Paragraph({ children: runs(b.v), spacing: { after: 30, line: 340 } }));
  }
  let header;
  if (img) {
    const data = Buffer.from(img.split(',')[1], 'base64'), type = img.startsWith('data:image/png') ? 'png' : 'jpg';
    header = new Header({ children: [new Paragraph({ children: [new ImageRun({ type, data, transformation: { width: 794, height: 1123 }, floating: {
      horizontalPosition: { relative: HorizontalPositionRelativeFrom.PAGE, offset: 0 }, verticalPosition: { relative: VerticalPositionRelativeFrom.PAGE, offset: 0 }, behindDocument: true, wrap: { type: TextWrappingType.NONE } } })] })] });
  } else {
    const c = (t, o) => new Paragraph({ alignment: AlignmentType.CENTER, children: [run(t, o)] });
    header = new Header({ children: [c(org.name, { bold: true, size: 38, sizeComplexScript: 38, color: '1F3A8A' }), ...(org.sub ? [c(org.sub, { size: 21, sizeComplexScript: 21 })] : []),
      new Paragraph({ alignment: AlignmentType.CENTER, border: { bottom: { style: BorderStyle.DOUBLE, size: 8, color: '1F3A8A', space: 4 } }, children: [run([org.address, org.contact].filter(Boolean).join('  |  '), { size: 19, sizeComplexScript: 19, color: '555555' })], spacing: { after: 200 } })] });
  }
  const doc = new Document({ sections: [{ properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: mm(img ? top : Math.max(top, 8)), bottom: mm(bottom), left: mm(18), right: mm(18), header: 400 } } }, headers: { default: header }, children: body }] });
  return Packer.toBuffer(doc);
}

// Letterhead PDF -> PNG (page 1) via pdftoppm
export async function pdfToPng(buf) {
  const dir = await mkdtemp(path.join(tmpdir(), 'lh-'));
  try {
    await writeFile(path.join(dir, 'in.pdf'), buf);
    await new Promise((res, rej) => execFile('pdftoppm', ['-png', '-r', '150', '-f', '1', '-l', '1', '-singlefile', path.join(dir, 'in.pdf'), path.join(dir, 'out')], { timeout: 30000 }, e => e ? rej(e) : res()));
    return 'data:image/png;base64,' + (await readFile(path.join(dir, 'out.png'))).toString('base64');
  } finally { rm(dir, { recursive: true, force: true }).catch(() => {}); }
}
