import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthService } from "../../src/service/auth.service";
import { hashPassword } from "../../src/utils/password";

describe('AuthService.changePassword', () => {
  let userRepository: any;
  let service: AuthService;
  let hashCorrente: string;

  beforeEach(async () => {
    hashCorrente = await hashPassword('passwordAttuale');

    userRepository = {
      findById: vi.fn().mockResolvedValue({
        id: 'user-1',
        nome: 'Mario',
        cognome: 'Rossi',
        email: 'mario.rossi@bugboard.it',
        password: hashCorrente,
        role: 'user',
        mustChangePassword: true,
      }),
      updatePassword: vi.fn().mockResolvedValue(undefined),
    };

    service = new AuthService(userRepository);
  });

  // Percorso 1: utente inesistente
  it("Lancia '[!] Errore: utente non trovato.' se l'utente non esiste", async () => {
    userRepository.findById.mockResolvedValue(undefined);

    await expect(
      service.changePassword('inesistente', 'passwordAttuale', 'passwordNuova'),
    ).rejects.toThrow('[!] Errore: utente non trovato.');

    expect(userRepository.updatePassword).not.toHaveBeenCalled();
  });

  // Percorso 2: password attuale errata
  it("Lancia '[!] Credenziali non valide' se la password attuale è errata", async () => {
    await expect(
      service.changePassword('user-1', 'passwordSbagliata', 'passwordNuova'),
    ).rejects.toThrow('[!] Credenziali non valide');

    expect(userRepository.updatePassword).not.toHaveBeenCalled();
  });

  // Percorso 3: la password nuova è identica a quella attuale
  it("Lancia '[!] Password identica' se la nuova coincide con quella attuale", async () => {
    await expect(
      service.changePassword('user-1', 'passwordAttuale', 'passwordAttuale'),
    ).rejects.toThrow('[!] Password identica');
  
    expect(userRepository.updatePassword).not.toHaveBeenCalled();
  });

  // Percorso 4: operazioni va a buon fine con dati validi
  it('Aggiorna la password quando i dati sono validi', async () => {
    await service.changePassword('user-1', 'passwordAttuale', 'passwordNuova');

    expect(userRepository.updatePassword).toHaveBeenCalledTimes(1);
  });

  // Percorso 5: la password salva deve essere un hash, non in chiaro
  it('Salva un hash argon2, non la password in chiaro', async () => {
    await service.changePassword('user-1', 'passwordAttuale', 'passwordNuova');

    const [id, hashSalvato] = userRepository.updatePassword.mock.calls[0];
    expect(id).toBe('user-1');
    expect(hashSalvato).not.toBe('passwordNuova');
    expect(hashSalvato).toMatch(/^\$argon2id\$/);
  });
});