import { verifyPassword, hashPassword } from "../utils/password.js";
import { createToken } from "../utils/jwt.js";
import { UserRepository } from "../repository/users.repository.js";
import { createRefreshToken, hashRefreshToken } from "../utils/refresh.js";

export class AuthService {
  constructor(private readonly userRepository: UserRepository){}

  /**
   * Servizio che permette di effettuare il login. 
   * Prende le credenziali e genera il token
   * @param email 
   * @param password 
   * @returns 
   */
  async login(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user)
      throw new Error('[!] Credenziali non valide');
  
    const passwordVerificata = await verifyPassword(user.password, password);
    if (!passwordVerificata)
      throw new Error('[!] Credenziali non valide');
    
    const refreshToken = createRefreshToken();
    await this.userRepository.setRefreshTokenHash(user.id, hashRefreshToken(refreshToken));
  
    return {
      accessToken: createToken({ sub: user.id, role: user.role }),
      refreshToken,
      user: {
        id: user.id,
        nome: user.nome, 
        cognome: user.cognome,
        email: user.email,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
      },
    };
  }

  /**
   * Servizio che permette di fare il logout
   * Annulla il refresh_token azzerando la colonna
   * @param userId 
   */
  async logout(userId: string) {
    await this.userRepository.setRefreshTokenHash(userId, null);
  }

  /**
   * Servizio che permette di aggiornare il refresh_token
   * Genera un token nuovo e cancella il vecchio
   * @param refreshToken 
   * @returns 
   */
    async refresh(refreshToken: string) {
    const hash = hashRefreshToken(refreshToken);
    const user = await this.userRepository.findByRefreshToken(hash); // ricerco in base al refresh_token così da non fidarci di nessun dato proveniente dal client
  
    if (!user)
      throw new Error('[!] Refresh Token non valido');
  
    const newRefreshToken = createRefreshToken();
    await this.userRepository.setRefreshTokenHash(user.id, hashRefreshToken(newRefreshToken));
  
    return {
      accessToken: createToken({ sub: user.id, role: user.role }),
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Servizio che permette di cambiare la password di un utente
   * @param userId 
   * @param currentPassword 
   * @param newPassword 
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.userRepository.findById(userId);
    if (!user)
      throw new Error('[!] Errore: utente non trovato.');
  
    const passwordVerificata = await verifyPassword(user.password, currentPassword);
  
    if (!passwordVerificata)
      throw new Error('[!] Credenziali non valide.');
  
    if (currentPassword === newPassword)
      throw new Error('[!] Password identica');
  
    await this.userRepository.updatePassword(userId, await hashPassword(newPassword));
  }


}