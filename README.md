# BugBoard2026
Progetto di Ingegneria del Software 2025/2026.
Piattaforma per la gestione collaborativa delle segnalazioni di progetti software. 
Marta Pagliuso - N86004844

## Indice 
- [Il sistema](#il-sistema)
- [Applicazione online](#applicazione-online)
- [Architettura](#architettura)
- [Tecnologie](#tecnologie)
- [Struttura del repository](#struttura-del-repository)
- [Esecuzione in locale](#esecuzione-in-locale)
- [Test](#test)
- [Qualità del codice](#qualità-del-codice)
- [Documentazione](#documentazione)

---

## Il sistema
BugBoard26 permette a un team di sviluppo di segnalare problemi, monitorarne l'andamento e assegnare la loro risoluzione a un responsabile, tenendo sempre sotto controllo ciò che è stato segnalato e come si è risolto.

**Funzionalità principali**
- Segnalazione di issue con tipologia (bug, domanda, documentazione, funzionalità), priorità facoltativa e immagine allegata
- Assegnazione a un membro del team e impostazione di scadenze, riservate agli amministratori
- Aggiornamento dello stato da parte dell'assegnatario, con notifica automatica al segnalatore via applicazione e posta elettronica
- Discussione tramite commenti su ciascuna segnalazione
- Ricerca testuale e filtri combinabili per stato, tipologia, priorità e assegnatario
- Vista di sintesi con dati aggregati, riservata agli amministratori
- Tre profili di accesso: amministratore, utente, utente in sola lettura

---

## Applicazione online
**https://bug-board2026.vercel.app**

| Ruolo | Email | Password |
|---|---|---|
| Amministratore | `admin@bugboard.it` | `password` |
| Utente | `demo.utente@bugboard.it` | `password` |
| Sola lettura | `demo.viewer@bugboard.it` | `password` |

> Il back-end è ospitato su un piano gratuito che sospende il servizio dopo un periodo di inattività: il primo accesso può richiedere fino a un minuto.

## Architettura
Due componenti indipendenti che comunicano esclusivamente tramite API REST.
```
+--------------+   REST/HTTPS   +--------------+        +--------------+
|   Angular    | -------------> |   Express    | -----> |  PostgreSQL  |
|   (client)   | <------------- |   (server)   | <----- |    (Neon)    |
+--------------+      JSON      +--------------+        +--------------+
     Vercel                          Render
```

## Tecnologie
**Back-end** — Node.js · TypeScript · Express 5 · Drizzle ORM · PostgreSQL · Zod · argon2 · jsonwebtoken · Multer · Sharp · Nodemailer
**Front-end** — Angular 21 · TypeScript · RxJS · Tailwind CSS 4
**Verifica e qualità** — Vitest · SonarCloud · GitHub Actions

# Struttura del repository
```
BugBoard2026/
├─ backend/
│  ├─ src/
│  │  ├─ controller/      traduzione HTTP <-> chiamate applicative
│  │  ├─ service/         regole di dominio
│  │  ├─ repository/      accesso ai dati
│  │  ├─ middleware/      autenticazione e autorizzazione
│  │  ├─ route/           definizione degli endpoint
│  │  ├─ db/              schema Drizzle e migrazioni
│  │  ├─ utils/           hashing, token, generazione email
│  │  └─ container.ts     composizione delle dipendenze
│  └─ tests/              test di unità
├─ frontend/
│  └─ src/app/
│     ├─ pages/           componenti associati a una rotta
│     ├─ components/      componenti riutilizzabili
│     ├─ services/        comunicazione con l'API e stato
│     ├─ guards/          controllo di accesso
│     ├─ interceptors/    trasformazioni sulle richieste HTTP
│     └─ models/          interfacce delle entità
└─ docs/                  documentazione di progetto
```

## Esecuzione in locale
**Prerequisiti** — Node.js 20 o superiore, un'istanza PostgreSQL raggiungibile.

### Back-end

```bash
cd backend
npm install
```

Creare un file `.env` a partire da `.env.example`:
```
  DATABASE_URL=postgresql://utente:password@host:5432/database
  JWT_SECRET=<stringa casuale di almeno 32 byte>
  ADMIN_EMAIL=admin@bugboard.it
  ADMIN_PASSWORD=<password iniziale dell'amministratore>
  CORS_ORIGIN=http://localhost:4200
  SMTP_HOST=localhost
  SMTP_PORT=1025
  MAIL_FROM=no-reply@bugboard.it
```
Il segreto per la firma dei token si genera con:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```
Applicare le migrazioni e avviare:

```bash
npx drizzle-kit migrate
npm run dev
```

Al primo avvio il sistema crea automaticamente l'account amministrativo con le credenziali indicate nel file di configurazione.

## Front-end

```bash
cd frontend
npm install
npm start
```
L'applicazione è raggiungibile su `http://localhost:4200`. Le chiamate all'API sono inoltrate al back-end tramite il proxy configurato in `proxy.conf.json`.

### Notifiche via posta

In sviluppo i messaggi sono intercettati da [Mailpit](https://github.com/axllent/mailpit), che non li recapita ad alcun destinatario e li rende consultabili su `http://localhost:8025`. Gli indirizzi generati dal sistema appartengono infatti a un dominio aziendale simulato.

---

## Test

```bash
cd backend
npm test                 # esecuzione della suite
npm run test:coverage    # con rapporto di copertura
```

La suite comprende 48 test su cinque unità, realizzati con Vitest. Le strategie adottate sono la suddivisione in classi di equivalenza per le funzioni con dominio ampio e la copertura strutturale per i metodi dei service.

I repository sono sostituiti da test double, possibilità offerta dall'iniezione delle dipendenze: la suite non richiede una base di dati e le variabili d'ambiente sono predisposte con valori fissi in `tests/setup.ts`.

## Qualità del codice

L'analisi statica è affidata a **SonarCloud**, integrata nel processo di sviluppo tramite GitHub Actions: a ogni modifica del ramo principale la pipeline installa le dipendenze, esegue i test, calcola la copertura e trasmette i risultati.

**Dashboard pubblica** — https://sonarcloud.io/project/overview?id=MartaPagliuso_BugBoard2026

| Security | Reliability | Maintainability |
|---|---|---|
| A | A | A |

---

La documentazione completa di progetto è disponibile in [`docs/BugBoard26.pdf`](docs/BugBoard26.pdf) e comprende:

- **Requisiti** — glossario, casi d'uso, caratterizzazione degli utenti, requisiti non funzionali, descrizione strutturata secondo Cockburn, prototipazione delle interfacce
- **Design** — architettura, scelte tecnologiche, schema di persistenza, design dell'interfaccia, diagrammi delle classi
- **Processo** — gestione del versioning, analisi statica
- **Verifica** — test plan, strategie di test, valutazione dell'usabilità mediante ispezione euristica e test con utenti

---

## Note

Le notifiche via posta elettronica non sono operative nell'ambiente di esercizio: il server di intercettazione impiegato in sviluppo è locale. Le notifiche interne all'applicazione funzionano regolarmente.
