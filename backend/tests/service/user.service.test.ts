import { describe, it, expect, vi, beforeEach } from "vitest";
import { UserService } from "../../src/service/user.service";

// Simula l'errore di violazione del vincolo di unicità di Postgres
function uniqueViolation() {
  const err: any = new Error('Valore di chiave duplicato viola il vincolo di unicità');
  err.code = '23505';
  return err;
}

// ------------ TEST DI CREATEUSER() ------------ 

describe('UserService.createUser', () => {
  let userRepository: any;
  let service : UserService;

  beforeEach(() => {
    userRepository = {
      insert: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      findAssignable: vi.fn(),
    };
    service = new UserService(userRepository);
  });

  // Percorso 1: nessun omonimo, inserimento al primo tentativo
  it("Genera l'email dal nome e inserisce l'utente", async () => {
    userRepository.insert.mockResolvedValue({ id: 'u1', email: 'mario.rossi@bugboard.it' });

    await service.createUser({ nome: 'Mario', cognome: 'Rossi', password: 'password123' });

    expect(userRepository.insert).toHaveBeenCalledTimes(1);
    const payload = userRepository.insert.mock.calls[0][0];
    expect(payload.email).toBe('mario.rossi@bugboard.it');
  });

  // Percorso 2: La password deve essere sempre hashata prima dell'inserimento
  it("Salva la password come hash argon2 e non in chiaro", async () => {
    userRepository.insert.mockResolvedValue({ id: 'u1' });

    await service.createUser({ nome: 'Mario', cognome: 'Rossi', password: 'password123' });

    const payload = userRepository.insert.mock.calls[0][0];
    expect(payload.password).not.toBe('password123');
    expect(payload.password).toMatch(/^\$argon2id\$/);
  });

  // Percorso 3: viene inserito il ruolo predefinito quando non viene specificato
  it("Assegna il ruolo 'user' per impostazione predefinita", async () => {
    userRepository.insert.mockResolvedValue({ id: 'u1' });

    await service.createUser({ nome: 'Mario', cognome: 'Rossi', password: 'password123' });
  
    expect(userRepository.insert.mock.calls[0][0].role).toBe('user');
  });

  // Percorso 4: il ruolo esplicitamente specificato non viene alterato
  it("Rispetta il ruolo esplicitamente indicato", async () => {
    userRepository.insert.mockResolvedValue({ id: 'u1' });

    await service.createUser({
      nome: 'Sara', cognome: 'Verdi', password: 'password123', role: 'viewer',
    });

    expect(userRepository.insert.mock.calls[0][0].role).toBe('viewer');
  });

  // Percorso 5: quando presente omonimia, il secondo utente ha il progressivo
  it("Aggiunge il progressivo quando l'email è già occupata", async () => {
    userRepository.insert
      .mockRejectedValueOnce(uniqueViolation())
      .mockResolvedValueOnce({ id: 'u2', email: 'mario.rossi2@bugboard.it' });


    await service.createUser({ nome: 'Mario', cognome: 'Rossi', password: 'password123' });

    expect(userRepository.insert).toHaveBeenCalledTimes(2);
    expect(userRepository.insert.mock.calls[0][0].email).toBe('mario.rossi@bugboard.it');
    expect(userRepository.insert.mock.calls[1][0].email).toBe('mario.rossi2@bugboard.it');
  });

  // Percorso 6: se ci sono più omonimi consecutivi, il progressivo continua a crescere
  it("Incrementa il progressivo su più collisioni consecutive", async () => {
    userRepository.insert
      .mockRejectedValueOnce(uniqueViolation())
      .mockRejectedValueOnce(uniqueViolation())
      .mockResolvedValueOnce({ id: 'u3', email: 'mario.rossi3@bugboard.it' });
    
    await service.createUser({ nome: 'Mario', cognome: 'Rossi', password: 'password123' });

    expect(userRepository.insert).toHaveBeenCalledTimes(3);
    expect(userRepository.insert.mock.calls[2][0].email).toBe('mario.rossi3@bugboard.it');
  });

  // Percorso 7: un errore diverso da quello di violazione di unicità non deve essere ritentato
  it("Propaga gli errori diversi da quello di violazione di unicità", async () => {
    userRepository.insert.mockRejectedValue(new Error('Connessione persa'));

    await expect(
      service.createUser({ nome: 'Mario', cognome: 'Rossi', password: 'password123' }),
    ).rejects.toThrow('Connessione persa');

    expect(userRepository.insert).toHaveBeenCalledTimes(1);
  });

  // Percorso 8: nome non valido. L'eccezione arriva da buildEmail
  it("Lancia un'eccezione se nome e cognome non contengono lettere valide", async () => {
    await expect (
      service.createUser({ nome: '', cognome: 'Rossi', password: 'password123' }),
    ).rejects.toThrow();

    expect(userRepository.insert).not.toHaveBeenCalled();
  });
});

// ------------ TEST DI GETPROFILE() ------------

describe('UserService.getProfile', () => {
  let userRepository: any;
  let service: UserService;

  beforeEach(() => {
    userRepository = { findById: vi.fn() };
    service = new UserService(userRepository);
  });

  // Percorso 1: utente non trovato
  it("Lancia '[!] Errore: utente non trovato' se l'utente non esiste", async () => {
    userRepository.findById.mockResolvedValue(undefined);

    await expect(service.getProfile('inesistente')).rejects.toThrow('[!] Utente non trovato');
  });

  // Percorso 2: Il profilo non deve mai mostrare la password né il refresh token
  it("Non espone password e refresh token", async () => {
    userRepository.findById.mockResolvedValue({
      id: 'u1', nome: 'Mario', cognome: 'Rossi',
      email: 'mario.rossi@bugboard.it', role: 'user',
      password: '$argon2id$hash', refreshTokenHash: 'abc123',
      mustChangePassword: false, createdAt: new Date(),
    });

    const profile = await service.getProfile('u1');

    expect(profile).not.toHaveProperty('password');
    expect(profile).not.toHaveProperty('refreshTokenHash');
    expect(profile.email).toBe('mario.rossi@bugboard.it');
  });
});

