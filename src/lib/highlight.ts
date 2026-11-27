/**
 * Outils de surlignage partagés par la recherche. Ils sont volontairement
 * isolés du moteur de recherche : la barre du haut peut ainsi afficher et
 * surligner les résultats sans télécharger tout l'index du parcours.
 */

/** Retire accents et casse pour comparer « élève » et « eleve ». */
export function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/** Découpe un texte en gardant la position exacte de la requête. */
export function splitHighlight(
  text: string,
  query: string,
): Array<{ text: string; match: boolean }> {
  const needle = normalize(query);
  if (needle.length < 2) return [{ text, match: false }];

  // Normalise caractère par caractère en gardant la position d'origine :
  // indispensable pour surligner correctement les mots accentués.
  let flat = "";
  const map: number[] = [];
  for (let index = 0; index < text.length; index += 1) {
    const piece = text[index]
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
    for (const character of piece) {
      flat += character;
      map.push(index);
    }
  }
  map.push(text.length);

  const parts: Array<{ text: string; match: boolean }> = [];
  let cursor = 0;
  let found = flat.indexOf(needle);
  while (found !== -1) {
    const start = map[found];
    const end = map[found + needle.length];
    if (start > cursor) parts.push({ text: text.slice(cursor, start), match: false });
    parts.push({ text: text.slice(start, end), match: true });
    cursor = end;
    found = flat.indexOf(needle, found + needle.length);
  }
  if (cursor < text.length) parts.push({ text: text.slice(cursor), match: false });
  return parts;
}
