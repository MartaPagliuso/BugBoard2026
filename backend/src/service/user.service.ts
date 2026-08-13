import { hashPassword } from "../utils/password.js";
import { buildEmail } from "../utils/email.js";
import { type UserRole } from '../db/schema/users.js';
import { UserRepository } from "../repository/users.repository.js";


export type CreateUserInput = {
  nome: string,
  cognome: string,
  password: string;
  role?: UserRole;
};

const MAX_ATTEMPTS = 20;

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

export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * Metodo per la creazione di un nuovo utente.
   * Effettua l'hashing della password e manda i dati al repository
   * @param input 
   * @returns 
   */
  async createUser(input: CreateUserInput) {
    const passwordHashed = await hashPassword(input.password);
  
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++){
      const email = buildEmail(input.nome, input.cognome, attempt === 0 ? undefined : attempt + 1);
  
      try {
        return await this.userRepository.insert({
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
   * Metodo che restituisce tutti gli utenti presenti nel sistema
   * @returns 
   */
  async listUsers() {
    return this.userRepository.findAll();
  }

  /**
   * Metodo che restituisce i dati di un determinato utente
   * @param userId 
   */
  async getProfile(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user)
      throw new Error('[!] Utente non trovato');
  
    return {
      id: user.id,
      nome: user.nome,
      cognome: user.cognome,
      email: user.email,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
      createdAt: user.createdAt,
    };
  }

  /**
   * Servizio che mostra l'elenco degli utenti a cui è possibile assegnare una issue
   */
  async listAssignableUsers() {
    return this.userRepository.findAssignable();
  }


}








