import { describe, it, expect } from 'vitest';
import { buildEmail } from '../../src/utils/email'

describe('buildEmail', () => {
  // Classe di equivalenza = nomi validi, solo lettere latine
  it('Genera l\'email nel formato nome.cognome@bugboard.it', () => {
    expect(buildEmail('Mario', 'Rossi')).toBe('mario.rossi@bugboard.it');
  });

  // Classe di equivalenza = caratteri accentati, da normalizzare
  it('Rimuove gli accenti dai caratteri', () => {
    expect(buildEmail('Niccolò', 'Perù')).toBe('niccolo.peru@bugboard.it');
  });

  // Classe di equivalenza = caratteri non alfabetici (apostrofi, spazi)
  it('Rimuove apostrofi e spazi', () => {
    expect(buildEmail('Anna Maria', "D'Amico")).toBe('annamaria.damico@bugboard.it');
  });

  // Classe di equivalenza = progressivo per omonimia
  it('Aggiunge un progressivo quando ci sono nomi uguali', () => {
    expect(buildEmail('Mario', 'Rossi', 2)).toBe('mario.rossi2@bugboard.it');
  });

  // Classe di equivalenza = progressivo non inserito
  it('Non aggiunge nulla se il suffisso è undifined', () => {
    expect(buildEmail('Mario', 'Rossi', undefined)).toBe('mario.rossi@bugboard.it');
  });

  // Classe di equivalenza = nome vuoto (invalido)
  it("Lancia '[!] Nome non valido' con nome vuoto", () => {
    expect(() => buildEmail('', 'Rossi')).toThrow('[!] Nome non valido');
  });

  // Classe di equivalenza = cognome vuoto (invalido)
  it("Lancia '[!] Nome non valido' con cognome vuoto", () => {
    expect(() => buildEmail('Mario', '')).toThrow('[!] Nome non valido');
  });

  // Classe di equivalenza = solo caratteri non latini (invalido)
  it("Lancia '[!] Nome non valido' con caratteri non latini vuoto", () => {
    expect(() => buildEmail('王', '李')).toThrow('[!] Nome non valido');
  });


})