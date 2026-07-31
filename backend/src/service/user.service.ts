import { hashPassword } from "../utils/password.js";
import { buildEmail } from "../utils/email.js";
import * as userRepository from "../repository/users.repository.js";

export type CreateUserInput = {
  nome: string,
  cognome: string,
  password: string;
  role?: 'user' | 'admin';
};

const MAX_ATTEMPTS = 20;

/**
 * Metodo per la creazione di un nuovo utente.
 * Effettua l'hashing della password e manda i dati al repository
 * @param input 
 * @returns 
 */
export async function createUser(input: CreateUserInput) {
  const passwordHashed = await hashPassword(input.password);

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++){
    const email = buildEmail(input.nome, input.cognome, attempt === 0 ? undefined : attempt + 1);

    try {
      return await userRepository.insertUser({
        nome: input.nome,
        cognome: input.cognome,
        email,
        password: passwordHashed,
        role: input.role ?? 'user',
      });
    } catch (error) {
      if (isUniqueViolation(error))
        continue;

      throw error;
    }
  }

  throw new Error('[!] Errore generazione email');
}

/**
 * Controlla se si tratta di una violazione unica
 * @param error 
 * @returns 
 */
function isUniqueViolation(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return false;
  const e = error as { code?: string; cause?: { code?: string} };
  return e.code === '23505' || e.cause?.code === '23505';
}

