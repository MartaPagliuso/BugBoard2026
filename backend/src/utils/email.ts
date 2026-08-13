const DOMAIN = 'bugboard.it';

/**
 * Metodo che si occupa di pulire l'input
 * @param value 
 * @returns 
 */
function slugify(value: string): string {
  return value
    .normalize('NFD')       // "à" diventa "a" + accento separato
    .replace(/[\u0300-\u036f]/g, '')      // rimuove gli accenti
    .toLowerCase()
    .replace(/[^a-z]/g, '');      // via spazi, apostrofi, trattini
}

export function buildEmail(nome: string, cognome: string, suffix?: number): string {
  const nomeFinale = slugify(nome);
  const cognomeFinale = slugify(cognome);

  if (!nomeFinale || !cognomeFinale)
    throw new Error('[!] Nome non valido.');

  return `${nomeFinale}.${cognomeFinale}${suffix ?? ''}@${DOMAIN}`;
} 