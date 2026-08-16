import { describe, it, expect, vi, beforeEach } from "vitest";
import { CommentService } from "../../src/service/comment.service";

// ------------ TEST DI CREATECOMMENT() ------------

describe('CommentService.createComment', () => {
  let commentRepository: any;
  let issueRepository: any;
  let service: CommentService;

  beforeEach(() => {
    commentRepository = {
      insert: vi.fn().mockResolvedValue({ id: 'c1', body: 'Testo' }),
      findByIssueId: vi.fn().mockResolvedValue([]),
    };
    issueRepository = {
      findById: vi.fn().mockResolvedValue({ id: 'issue-1' }),
    };
    service = new CommentService(commentRepository, issueRepository);
  });

  // Percorso 1: la issue associata ai commenti non esiste
  it("Lancia '[!] Issue non trovata' se la issue non esiste", async () => {
    issueRepository.findById.mockResolvedValue(undefined);

    await expect(
      service.createComment('inesistente', 'Un commento', 'user-1'),
    ).rejects.toThrow('[!] Issue non trovata');

    expect(commentRepository.insert).not.toHaveBeenCalled();
  });

  // Percorso 2: inserimento del commento valido
  it('Inserisce il commento e lo associa alla issue e all\'autore', async () => {
    await service.createComment('issue-1', 'Un commento', 'user-1');

    expect(commentRepository.insert).toHaveBeenCalledWith({
      issueId: 'issue-1',
      body: 'Un commento',
      authorId: 'user-1',
    });
  });
});

// ------------ TEST DI LISTCOMMENTSBYISSUE() ------------

describe('CommentService.listCommentByIssue', () => {
  let commentRepository: any;
  let issueRepository: any;
  let service: CommentService;

  beforeEach(() => {
    commentRepository = { findByIssueId: vi.fn().mockResolvedValue([]) };
    issueRepository = { findById: vi.fn().mockResolvedValue({ id: 'issue-1' }) };
    service = new CommentService(commentRepository, issueRepository);
  });

  // Percorso 1: lancia eccezione se la issue non esiste
  it("Lancia '[!] Issue non trovata' se la issue non esiste", async () => {
    issueRepository.findById.mockResolvedValue(undefined);

    await expect(service.listCommentsByIssue('inesistente')).rejects.toThrow('[!] Issue non trovata');
    expect(commentRepository.findByIssueId).not.toHaveBeenCalled();
  });

  // Percorso 2: array vuoto se la issue non ha commenti
  it("Restituisce un array vuoto se la issue non presenta commenti", async () => {
    const result = await service.listCommentsByIssue('issue-1');
    expect(result).toEqual([]);
  });

  // Percorso 3: la issue ha commenti e vengono ritornati
  it("Restituisce i commenti della issue", async () => {
    commentRepository.findByIssueId.mockResolvedValue([
      { id: 'c1', body: 'Primo' },
      { id: 'c2', body: 'Secondo' },
    ]);

    const result = await service.listCommentsByIssue('issue-1');
    expect(result).toHaveLength(2);
  });
});