/**
 * Pattern translations for text that contains dynamic values (counts, titles, amounts, dates).
 * Each row is [English template, Tamil template, Hindi template]; {0}, {1} are the dynamic parts,
 * which are themselves translated (or localised) before being inserted.
 */
import type { Language } from './index';

const ROWS: [string, string, string][] = [
  ["Removes in {0}d", "{0} நாட்களில் நீக்கப்படும்", "{0} दिन में हटेगा"],
  ["Layer active: {0}", "செயலில் உள்ள அடுக்கு: {0}", "लेयर सक्रिय: {0}"],
  ["Step {0}", "படி {0}", "चरण {0}"],
  ["{0} (opens official website in a new tab)", "{0} (அதிகாரப்பூர்வ இணையதளத்தைப் புதிய தாவலில் திறக்கும்)", "{0} (आधिकारिक वेबसाइट नई टैब में खुलती है)"],
  ["Please sign in to schedule a site visit for {0}.", "{0} க்கான தள வருகையை திட்டமிட தயவுசெய்து உள்நுழையுங்கள்.", "{0} के लिए साइट विज़िट निर्धारित करने हेतु कृपया साइन इन करें।"],
  ["Please sign in to schedule a proposal for {0}.", "{0} க்கான முன்மொழிவை திட்டமிட தயவுசெய்து உள்நுழையுங்கள்.", "{0} के लिए प्रस्ताव निर्धारित करने हेतु कृपया साइन इन करें।"],
  ["Please sign in to schedule a callback for {0}.", "{0} க்கான திரும்ப அழைப்பை திட்டமிட தயவுசெய்து உள்நுழையுங்கள்.", "{0} के लिए कॉलबैक निर्धारित करने हेतु कृपया साइन इन करें।"],
  ["Pay {0} Securely", "{0} பாதுகாப்பாகச் செலுத்துங்கள்", "{0} का सुरक्षित भुगतान करें"],
  ["Property: {0}", "சொத்து: {0}", "संपत्ति: {0}"],
  ["Polygon Blockchain verification for {0}", "{0} க்கான பாலிகான் பிளாக்செயின் சரிபார்ப்பு", "{0} के लिए पॉलीगॉन ब्लॉकचेन सत्यापन"],
  ["Document: {0}", "ஆவணம்: {0}", "दस्तावेज़: {0}"],
  ["Download {0}", "{0} ஐப் பதிவிறக்குங்கள்", "{0} डाउनलोड करें"],
  ["Value: {0}", "மதிப்பு: {0}", "मूल्य: {0}"],
  ["Access code sent. For demo: {0}", "அணுகல் குறியீடு அனுப்பப்பட்டது. டெமோவுக்கு: {0}", "एक्सेस कोड भेज दिया गया है। डेमो के लिए: {0}"],
  ["Authentication failed: {0}", "அங்கீகாரம் தோல்வியடைந்தது: {0}", "प्रमाणीकरण विफल रहा: {0}"],
  ["View image {0}", "படம் {0} ஐப் பார்க்கவும்", "छवि {0} देखें"],
  ["Corner {0}", "மூலை {0}", "कोना {0}"],
  ["{0} Acres", "{0} ஏக்கர்", "{0} एकड़"],
  ["{0} Acre", "{0} ஏக்கர்", "{0} एकड़"],
  ["{0}% CAGR", "{0}% ஆண்டு கூட்டு வளர்ச்சி விகிதம்", "{0}% चक्रवृद्धि वार्षिक वृद्धि दर"],
  ["Uploaded property {0}", "பதிவேற்றப்பட்ட சொத்து {0}", "अपलोड की गई संपत्ति {0}"],
  ["A new agricultural estate \"{0}\" is now available in {1}.", "\"{0}\" என்ற புதிய விவசாய எஸ்டேட் இப்போது {1} இல் கிடைக்கிறது.", "{1} में एक नया कृषि एस्टेट \"{0}\" अब उपलब्ध है।"],
  ["{0} minutes ago", "{0} நிமிடங்களுக்கு முன்", "{0} मिनट पहले"],
  ["{0} minute ago", "{0} நிமிடத்திற்கு முன்", "{0} मिनट पहले"],
  ["{0} hours ago", "{0} மணி நேரத்திற்கு முன்", "{0} घंटे पहले"],
  ["{0} days ago", "{0} நாட்களுக்கு முன்", "{0} दिन पहले"],
  ["{0} weeks ago", "{0} வாரங்களுக்கு முன்", "{0} सप्ताह पहले"],
  ["{0} week ago", "{0} வாரத்திற்கு முன்", "{0} सप्ताह पहले"],
  ["{0} months ago", "{0} மாதங்களுக்கு முன்", "{0} महीने पहले"],
  ["{0} month ago", "{0} மாதத்திற்கு முன்", "{0} महीने पहले"],
  ["{0} Cr", "{0} கோடி", "{0} करोड़"],
  ["{0} Lakh", "{0} லட்சம்", "{0} लाख"],
  ["{0} Lakhs", "{0} லட்சம்", "{0} लाख"],
  ["{0} L", "{0} லட்சம்", "{0} लाख"],
  ["{0} km", "{0} கி.மீ", "{0} किमी"],
  ["{0} sq.ft", "{0} சதுர அடி", "{0} वर्ग फुट"],
  ["{0} sq.ft.", "{0} சதுர அடி", "{0} वर्ग फुट"],
  ["{0} yrs", "{0} ஆண்டுகள்", "{0} वर्ष"],
  ["{0} years", "{0} ஆண்டுகள்", "{0} वर्ष"],
  ["{0} year", "{0} ஆண்டு", "{0} वर्ष"],
  ["{0} Years", "{0} ஆண்டுகள்", "{0} वर्ष"],
  ["{0} Year", "{0} ஆண்டு", "{0} वर्ष"],
  ["{0} can be reviewed as an agricultural estate with a {1} income view. IGO will check land size, water, soil, access, crop use, operating cost, buyer route, and market demand before discussing realistic earning potential.", "{0} ஐ {1} வருமானக் கண்ணோட்டத்துடன் ஒரு விவசாய எஸ்டேட்டாக மதிப்பாய்வு செய்யலாம். யதார்த்தமான வருமான வாய்ப்பைப் பற்றி விவாதிப்பதற்கு முன், ஐ.ஜி.ஓ நில அளவு, நீர், மண், அணுகல், பயிர் பயன்பாடு, இயக்கச் செலவு, வாங்குவோர் வழி மற்றும் சந்தை தேவையைச் சரிபார்க்கும்.", "{0} की समीक्षा {1} आय दृष्टिकोण वाले कृषि एस्टेट के रूप में की जा सकती है। वास्तविक कमाई की संभावना पर चर्चा से पहले आई.जी.ओ भूमि का आकार, पानी, मिट्टी, पहुँच मार्ग, फसल उपयोग, परिचालन लागत, खरीदार मार्ग और बाज़ार माँग की जाँच करेगा।"],
  ["For {0}, IGO reviews soil, water source, access, power, climate, crop suitability, and current land use so the buyer understands how practical the estate is before purchase.", "{0} க்கு, வாங்குபவர் எஸ்டேட் எவ்வளவு நடைமுறைக்கு உகந்தது என்பதை வாங்கும் முன் புரிந்துகொள்ளும்படி, ஐ.ஜி.ஓ மண், நீர் ஆதாரம், அணுகல், மின்சாரம், காலநிலை, பயிர் ஏற்புத்தன்மை மற்றும் தற்போதைய நில பயன்பாட்டை மதிப்பாய்வு செய்கிறது.", "{0} के लिए आई.जी.ओ मिट्टी, जल स्रोत, पहुँच मार्ग, बिजली, जलवायु, फसल उपयुक्तता और वर्तमान भूमि उपयोग की समीक्षा करता है, ताकि खरीदार को खरीद से पहले पता चल सके कि एस्टेट कितना व्यावहारिक है।"],
  ["Before a customer buys {0}, IGO reviews the title chain, survey, tax records, water access, boundary clarity, and registration readiness. Legal clarity comes before token payment or sale closure.", "வாடிக்கையாளர் {0} ஐ வாங்கும் முன், ஐ.ஜி.ஓ உரிமைச் சங்கிலி, நில அளவை, வரிப் பதிவுகள், நீர் வசதி, எல்லைத் தெளிவு மற்றும் பதிவுக்கான தயார்நிலையை மதிப்பாய்வு செய்கிறது. முன்பணம் செலுத்துவதற்கோ விற்பனையை முடிப்பதற்கோ முன் சட்டத் தெளிவு வரும்.", "ग्राहक के {0} खरीदने से पहले आई.जी.ओ स्वामित्व श्रृंखला, सर्वे, कर रिकॉर्ड, जल उपलब्धता, सीमा की स्पष्टता और पंजीकरण की तैयारी की समीक्षा करता है। कानूनी स्पष्टता टोकन भुगतान या बिक्री पूर्ण होने से पहले आती है।"],
  ["I can help you understand {0} as a buy/sell agricultural estate. Ask about land value, crop use, water, legal checks, site visit, or resale potential.", "{0} ஐ வாங்க/விற்க உகந்த விவசாய எஸ்டேட்டாகப் புரிந்துகொள்ள நான் உதவ முடியும். நில மதிப்பு, பயிர் பயன்பாடு, நீர், சட்டச் சரிபார்ப்புகள், தள வருகை அல்லது மறுவிற்பனை வாய்ப்பு பற்றிக் கேளுங்கள்.", "मैं {0} को खरीद/बिक्री योग्य कृषि एस्टेट के रूप में समझने में आपकी मदद कर सकता हूँ। भूमि मूल्य, फसल उपयोग, पानी, कानूनी जाँच, साइट विज़िट या पुनर्विक्रय की संभावना के बारे में पूछें।"],
  ["Hello. I can help prepare a buyer document summary or draft discussion points for **{0}**. You can ask about sale agreement terms, lease terms, water rights, ownership transfer, or managed-farm responsibilities.", "வணக்கம். **{0}** க்கான வாங்குபவர் ஆவணச் சுருக்கத்தைத் தயாரிக்க அல்லது விவாதக் குறிப்புகளை வரைய நான் உதவ முடியும். விற்பனை ஒப்பந்த விதிமுறைகள், குத்தகை விதிமுறைகள், நீர் உரிமைகள், உரிமை மாற்றம் அல்லது பராமரிக்கப்படும் பண்ணைப் பொறுப்புகள் பற்றிக் கேட்கலாம்.", "नमस्कार। मैं **{0}** के लिए खरीदार दस्तावेज़ का सारांश तैयार करने या चर्चा के बिंदुओं का मसौदा बनाने में मदद कर सकता हूँ। आप बिक्री अनुबंध की शर्तों, पट्टे की शर्तों, जल अधिकार, स्वामित्व हस्तांतरण या प्रबंधित-फार्म की ज़िम्मेदारियों के बारे में पूछ सकते हैं।"],
  ["I have prepared a draft summary covering the requested terms, including ownership or lease structure, soil maintenance, water rights, farm access, and legal review requirements. The draft is ready for your review.", "கோரிய விதிமுறைகளை உள்ளடக்கிய வரைவுச் சுருக்கத்தை நான் தயாரித்துள்ளேன்; அதில் உரிமை அல்லது குத்தகை அமைப்பு, மண் பராமரிப்பு, நீர் உரிமைகள், பண்ணை அணுகல் மற்றும் சட்ட மதிப்பாய்வுத் தேவைகள் அடங்கும். வரைவு உங்கள் மதிப்பாய்வுக்குத் தயாராக உள்ளது.", "मैंने अनुरोधित शर्तों का मसौदा सारांश तैयार किया है, जिसमें स्वामित्व या पट्टे की संरचना, मिट्टी का रखरखाव, जल अधिकार, फार्म तक पहुँच और कानूनी समीक्षा की आवश्यकताएँ शामिल हैं। मसौदा आपकी समीक्षा के लिए तैयार है।"],
];

const MONTHS: Record<'ta' | 'hi', string[]> = {
  ta: ['ஜனவரி', 'பிப்ரவரி', 'மார்ச்', 'ஏப்ரல்', 'மே', 'ஜூன்', 'ஜூலை', 'ஆகஸ்ட்', 'செப்டம்பர்', 'அக்டோபர்', 'நவம்பர்', 'டிசம்பர்'],
  hi: ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'],
};
const MON = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const monthIndex = (s: string) => MON.indexOf(s.slice(0, 3).toLowerCase());

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

type Rule = { re: RegExp; tpl: Record<'ta' | 'hi', string> };
const RULES: Rule[] = ROWS.map(([en, ta, hi]) => {
  const unit = en.startsWith('{0}') && en.length < 22 && !en.includes('{1}');
  const body = escape(en).replace(/\\\{(\d)\\\}/g, (_m) => (unit ? '([\\d][\\d.,\\- ]*?)' : '(.+?)'));
  return { re: new RegExp(`^${body}$`), tpl: { ta, hi } };
}).sort((a, b) => b.re.source.length - a.re.source.length);

const TIME = /^(\d{1,2}:\d{2}) ?(AM|PM)$/i;
const MONEY = /^₹\s?([\d.,]+)\s?(Cr|Crores?|L|Lakhs?)(\+)?$/i;
const DATE_FULL = /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.? (\d{1,2}),? (\d{4})$/i;
const DATE_DMY = /^(\d{1,2}) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?,? (\d{4})$/i;
const DATE_MY = /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.? (\d{4})$/i;

/** Returns a translation for dynamic text, or undefined when no pattern matches. */
export const applyPatterns = (lang: Language, text: string, tr: (s: string) => string): string | undefined => {
  if (lang === 'en') return undefined;
  const l = lang as 'ta' | 'hi';
  let m = TIME.exec(text);
  if (m) {
    const h = Number(m[1].split(':')[0]) % 12;
    const pm = m[2].toUpperCase() === 'PM';
    const part = l === 'ta' ? (!pm ? 'காலை' : h < 4 ? 'மதியம்' : 'மாலை') : !pm ? 'सुबह' : h < 4 ? 'दोपहर' : 'शाम';
    return `${part} ${m[1]}`;
  }
  m = MONEY.exec(text);
  if (m) {
    const lakh = /^l/i.test(m[2]);
    const unit = l === 'ta' ? (lakh ? 'லட்சம்' : 'கோடி') : lakh ? 'लाख' : 'करोड़';
    return `₹${m[1]} ${unit}${m[3] ?? ''}`;
  }
  m = DATE_FULL.exec(text);
  if (m) return `${m[2].padStart(2, '0')} ${MONTHS[l][monthIndex(m[1])]} ${m[3]}`;
  m = DATE_DMY.exec(text);
  if (m) return `${m[1].padStart(2, '0')} ${MONTHS[l][monthIndex(m[2])]} ${m[3]}`;
  m = DATE_MY.exec(text);
  if (m) return `${MONTHS[l][monthIndex(m[1])]} ${m[2]}`;
  for (const r of RULES) {
    m = r.re.exec(text);
    if (m) return r.tpl[l].replace(/\{(\d)\}/g, (_x, i) => tr(m![Number(i) + 1] ?? ''));
  }
  return undefined;
};
