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

})