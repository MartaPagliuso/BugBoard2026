import { describe, it, expect, vi, beforeEach } from "vitest";
import { IssueService } from "../../src/service/issue.service";

// Issue usata come base per effettuare i vari test
const baseIssue = {
  id: 'issue-1',
  title: 'Titolo di prova',
  description: 'Descrizione',
  type: 'bug',
  status: 'in_progress',
  priority: null,
  imageUrl: null,
  duaDate: null,
  resolvedAt: null,
  createdAt: new Date('2026-08-01T10:00:00Z'),
  updatedAt: new Date('2026-08-01T10:00:00Z'),
  authorId: 'author-1',
  assigneeId: 'assignee-1',
  author: { id: 'author-1', nome: 'Mario', cognome: 'Rossi' },
  assignee: { id: 'assignee-1', nome: 'Luca', cognome: 'Bianchi' },
};

// ------------ TEST DI UPDATEISSUESTATUS() ------------

describe('IssueService.updateIssueStatus', () => {
  let issueRepository: any;
  let userRepository: any;
  let notificationService: any;
  let service: IssueService;

  // Serve per ricreare i mock prima di ogni test
  beforeEach(() => {
    issueRepository = {
      findById: vi.fn().mockResolvedValue({ ...baseIssue }),
      update: vi.fn().mockResolvedValue(undefined),
    };

    userRepository = { findById: vi.fn() };
    notificationService = { notifyIssueResolved: vi.fn().mockResolvedValue(undefined) };
    service = new IssueService(issueRepository, userRepository, notificationService);
  });

  // Percorso 1: issue non trovata => uscita immediata
  it("Lancia '[!] Issue non trovata' se la issue non esiste", async () => {
    issueRepository.findById.mockResolvedValue(undefined);
    await expect(
      service.updateIssueStatus('inesistente', 'done', 'assignee-1', 'user'),
    ).rejects.toThrow('[!] Issue non trovata');

    expect(issueRepository.update).not.toHaveBeenCalled();
  });

  // Percorso 2: l'utente non è nè un assegnatario nè un admin => autorizzazione negata
  it("Lancia '[!] Vietato' se l'utente non è assegnatario né admin", async () => {
    await expect(
      service.updateIssueStatus('issue-1', 'done', 'estraneo-1', 'user'),
    ).rejects.toThrow('[!] Vietato');
    
    expect(issueRepository.update).not.toHaveBeenCalled();
  });

  // Percorso 2b: l'admin non è l'assegnatario => autorizzato
  it("Permette a un admin non assegnatario di cambiare lo stato", async () => {
    await service.updateIssueStatus('issue-1', 'todo', 'admin-1', 'admin');

    expect(issueRepository.update).toHaveBeenCalledWith(
      'issue-1',
      expect.objectContaining({ status: 'todo' }),
    );
  });

  // Percorso 3: la issue viene risolta per la prima volta => resolvedAt valorizzato e notifica inviata
  it("Valorizza resolvedAt e notifica alla prima risoluzione", async () => {
    await service.updateIssueStatus('issue-1', 'done', 'assignee-1', 'user');

    const [, payload] = issueRepository.update.mock.calls[0]; // estrae gli argomenti della prima chiamata
    expect(payload.status).toBe('done');
    expect(payload.resolvedAt).toBeInstanceOf(Date);

    expect(notificationService.notifyIssueResolved).toHaveBeenCalledTimes(1);
  });

  // Percorso 4: la issue è già stata risolta una volta => resolvedAt invariato e nessuna notifica
  it("Non sovrascrive resolvedAt né rimanda la notifica se la issue è già risolta", async () => {
    const risolta = new Date('2026-08-05T09:00:00Z');
    issueRepository.findById.mockResolvedValue({ ...baseIssue, status: 'done', resolvedAt: risolta });

    await service.updateIssueStatus('issue-1', 'done', 'assignee-1', 'user');

    const [, payload] = issueRepository.update.mock.calls[0];
    expect(payload.resolvedAt).toBe(risolta);

    expect(notificationService.notifyIssueResolved).not.toHaveBeenCalled();
  });

  // Percorso 5: la issue viene riaperta dopo essere stata risolta => resolvedAt originale preservato
  it("Preserva il resolvedAt originale quando la issue viene richiusa", async () => {
    const risolta = new Date('2026-08-05T09:00:00Z');
    issueRepository.findById.mockResolvedValue({ ...baseIssue, status: 'todo', resolvedAt: risolta });

    await service.updateIssueStatus('issue-1', 'done', 'assignee-1', 'user');
    const [, payload] = issueRepository.update.mock.calls[0];
    expect(payload.resolvedAt).toBe(risolta);
  });

  // Percorso 6: notifica fallisce => il cambio stato funziona comunque
  it("Completa il cambio di stato anche se la notifica fallisce", async () => {
    notificationService.notifyIssueResolved.mockRejectedValue(new Error('SMTP down'));

    await expect(
      service.updateIssueStatus('issue-1', 'done', 'assignee-1', 'user')
    ).resolves.not.toThrow();

    expect(issueRepository.update).toHaveBeenCalled();
  });

});

// ------------ TEST DI ASSIGNISSUE() ------------

describe('IssueService.assignIssue', () => {
  let issueRepository: any;
  let userRepository: any;
  let notificationService: any;
  let service: IssueService;

  beforeEach(() => {
    issueRepository = {
      findById: vi.fn().mockResolvedValue({ ...baseIssue }),
      update: vi.fn().mockResolvedValue(undefined),
    };

    userRepository = { findById: vi.fn().mockResolvedValue({ id: 'assignee-2', role: 'user' })};
    notificationService = { notifyIssueResolved: vi.fn() };
    service = new IssueService(issueRepository, userRepository, notificationService);
  });

  // Percorso 1: l'assegnatario non esiste
  it("Lancia '[!] Assegnatario non trovato' se l'utente indicato non esiste", async () => {
    userRepository.findById.mockResolvedValue(undefined);

    await expect(service.assignIssue('issue-1', 'inesistente')).rejects.toThrow('[!] Assegnatario non trovato');
    expect(issueRepository.update).not.toHaveBeenCalled();
  });

  // Percorso 2: un utente in sola lettura non può ricevere assegnazioni
  it("Lancia '[!] Assegnatario non valido' se l'utente è un viewer", async () => {
    userRepository.findById.mockResolvedValue({ id: 'viewer-1', role: 'viewer' });

    await expect(service.assignIssue('issue-1', 'viewer-1')).rejects.toThrow('[!] Assegnatario non valido');
    expect(issueRepository.update).not.toHaveBeenCalled();
  });

  // Percorso 3: assegnazione a un utente valido
  it("Assegna la issue a un utente valido", async () => {
    await service.assignIssue('issue-1', 'assignee-2');

    const [id, payload] = issueRepository.update.mock.calls[0];
    expect(id).toBe('issue-1');
    expect(payload.assigneeId).toBe('assignee-2');
  });
});

// ------------ TEST DI SETDUEDATE() ------------

describe('IssueService.setDueDate', () => {
  let issueRepository: any;
  let service: IssueService;

  beforeEach(() => {
    issueRepository = {
      findById: vi.fn().mockResolvedValue({ ...baseIssue }),
      update: vi.fn().mockResolvedValue(undefined),
    };

    service = new IssueService(issueRepository, {} as any, {} as any);
  });

  // Percorso 1: lancia eccezione quando la issue non viene trovata
  it("Lancia '[!] Issue non trovata' se la issue non esiste", async () => {
    issueRepository.findById.mockResolvedValue(undefined);

    await expect(service.setDueDate('inesistente', new Date('2030-01-01'))).rejects.toThrow('[!] Issue non trovata');
  })

  // Percorso 2: Una scadenza già trascorsa non ha senso e va rifiutata
  it("Lancia '[!] Scadenza già trascorsa' con una data passata", async () => {
    await expect(service.setDueDate('issue-1', new Date('2020-01-01'))).rejects.toThrow('[!] Scadenza già trascorsa');
    expect(issueRepository.update).not.toHaveBeenCalled();
  });

  // Percorso 3: viene impostata una scadenza futura
  it("Imposta una scadenza futura", async () => {
    const scadenza = new Date(Date.now() + 86_400_000) // data di domani
    await service.setDueDate('issue-1', scadenza);

    expect(issueRepository.update.mock.calls[0][1].dueDate).toBe(scadenza);
  });

  // Percorso 4: inserire null rimuove la scadenza
  it("Permette di rimuovere la scadenza mettendo null", async () => {
    await service.setDueDate('issue-1', null);
    expect(issueRepository.update.mock.calls[0][1].dueDate).toBeNull();
  });
});

// ------------ TEST DI UPDATEISSUE() ------------

describe('IssueService.updateIssue', () => {
  let issueRepository: any;
  let service: IssueService;

  beforeEach(() => {
    issueRepository = {
      findById: vi.fn().mockResolvedValue({ ...baseIssue }),
      update: vi.fn().mockResolvedValue(undefined),
    };

    service = new IssueService(issueRepository, {} as any, {} as any);
  });


  // Percorso 1: lancia eccezione quando la issue non viene trovata
  it("Lancia '[!] Issue non trovata' se la issue non esiste", async () => {
    issueRepository.findById.mockResolvedValue(undefined);

    await expect(
      service.updateIssue('inesistente', { title: 'nuovo' }, 'author-1', 'user'),
    ).rejects.toThrow('[!] Issue non trovata');
  });

  // Percorso 2: solo autore e admin possono modificare la issue
  it("Lancia '[!] Vietato' se l'utente non è autore ne admin", async () => {
    await expect(
      service.updateIssue('issue-1', { title: 'nuovo' }, 'estraneo-1', 'user')
    ).rejects.toThrow('[!] Vietato');

    expect(issueRepository.update).not.toHaveBeenCalled();
  });

  // Percordo 3: l'autore può modificare la issue
  it("Permette all'autore di modificare la issue", async () => {
    await service.updateIssue('issue-1', { title: 'Titolo corretto' }, 'author-1', 'user');

    expect(issueRepository.update.mock.calls[0][1].title).toBe('Titolo corretto');
  });

  // Percorso 4: admin può modificare la issue di un altro utente
  it("Permette a un admin di modificare la issue di un altro utente", async () => {
    await service.updateIssue('issue-1', { title: 'Corretto da admin' }, 'admin-1', 'admin');

    expect(issueRepository.update).toHaveBeenCalled();
  });
});

// ------------ TEST DI GETISSUEBYID() ------------

describe('IssueService.getIssueById', () => {
  // Percorso 1: lancia eccezione quando la issue non viene trovata
  it("Lancia '[!] Issue non trovata' se la issue non esiste", async () => {
    const issueRepository: any = { findById: vi.fn().mockResolvedValue(undefined) };
    const service = new IssueService(issueRepository, {} as any, {} as any);

    await expect(service.getIssueById('inesistente')).rejects.toThrow('[!] Issue non trovata');
  });

  // Percorso 2: resitituisce la issue se esiste
  it("Restituisce la issue quando esiste", async () => {
    const issueRepository: any = { findById: vi.fn().mockResolvedValue({ ...baseIssue }) };
    const service = new IssueService(issueRepository, {} as any, {} as any);

    const issue = await service.getIssueById('issue-1');
    expect(issue.id).toBe('issue-1');
  });
});