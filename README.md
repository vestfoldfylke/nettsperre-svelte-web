## Notes
### Nettsperre


Grupper:
1. NETTSPERRE-EKSAMEN-MAN
<!-- NETTSPERRE-PROVE-MAN -->
<!-- NETTSPERRE-TEAMS-MAN  -->
<!-- NETTSPERRE-OFFLINE-MAN -->

### Database
En mongoDB database, se intern docs for detaljer.
#### Collections
    Sperringer - inneholder sperringer som venter på å bli aktivert og de som er aktivert. 

    Historie - inneholder alle sperringer som er utgått/slettet

# Nettsperre
En Webapp med SvelteKit som er hostet i Vercel.
Løsningen gir lærere og andre superbrukere mulighet til å sperre undervisningsgrupper og enkelt elever fra ulike løsninger og internett. 

De ulike sperrene: 
1. Prøve. (TBA)
2. Kun tilgang til teams. (TBA)
3. Eksamen.
4. Offline. (TBA)

## Deploy løsningen 
### Requirements
Se intern docs for detaljer. 

1. Azure app registrering for autentisering
2. [azf-nettsperre](https://github.com/telemarkfylke/azf-nettsperre)
### App settings
Opprett en .env fil
| Key                             | Value                                                                 | Beskrivelse                                                                 |
|---------------------------------|-----------------------------------------------------------------------|-----------------------------------------------------------------------------|
| VITE_CLIENT_ID                  |                                  | Klient-ID for applikasjonen                                                 |
| VITE_TENANT_ID                  |                                   | Tenant-ID for Azure AD                                                   |
| VITE_CLIENT_ISS                 | | Utsteder-URL for Azure AD                                                   |
| VITE_REDIRECT_URI               | http://localhost:5173                                                 | Redirect URI                                       |
| VITE_DEFAULT_SCOPE              |        | Standard scope for API-tilgang                                              |
| VITE_RETURN_ONLY_STUDENTS       | true/false                                                                  | Returner kun studenter (i test kan dette settes til false for å teste andre brukere) |
| VITE_NETTSPERRE_API_URL         | http://localhost:7071/api                                             | URL til API for nettsperre                                                  |
| VITE_MOCK_MSAL                  |  true/false                                                                 | Bruk mock MSAL (false for ekte MSAL)                                        |
| VITE_COUNTY                     | Telemark                                                              | Fylke                                                                      |
| VITE_DISABLE_EKSAMEN            |  true/false                                                                 | Deaktivere eksamensperre                                                    |
| VITE_DISABLE_FULLBLOCK          |  true/false                                                                 | Deaktivere full blokkering                                                   |
| VITE_DISABLE_PROVE              |  true/false                                                                  | Deaktivere prøvesperre                                                       |
| VITE_SUPERUSER_ROLE             |                                                                   | Rolle for superbruker                                                       |
| VITE_SEARCH_GROUP               |                                   | Gruppe-ID for søk                                                           |
### Local Development
```bash
## Installer dependencies
npm i

## Start prosjektet 
npm run dev
```
## Backend
Backend er bygget i azure functions, du kan lese mer om den her: [azf-nettsperre](https://github.com/telemarkfylke/azf-nettsperre)


## Roller
Kort beskrivelse av de ulike rollene, hva de kan gjøre og generelt hvem som har tilgang til rollene. 
1. Lærer - default access til applikasjonen. Læreren har lov til å sette sperre på elevene i sin(e) undervisningsgrupper
2. Superbruker - Ledere/Administrasjon/Servicedesk, lov til å sette sperre på elever/undervinsinsgrupper innad på skolen og på vegne av en lærer. 
3. Admin - Utviklere. Se logger og detaljer i løsningen.

## Use cases
Generell beskrivelse av noen use cases
### Lærer 
#### Sperre en enkelt elev
1. Lærer søker opp undervisningsgruppen som eleven er medlem av.
2. Velger bort alle elevene og velger kun den/de elevene som skal sperres. 
3. Velger hvilke sperringer som skal settes.
4. Velger ikke å sette et tidspunkt, sperringen vil skje med en gang. 
5. Sjekker at alt ser bra ut og sender sperringen. 
#### Sperre en undervisningsgruppe
1. Lærer søker opp undervisningsgruppen.
2. Alle elevene er automatisk valgt. 
3. Velger hvilke sperringer som skal settes.
4. Velger ikke å sette et tidspunkt, sperringen vil skje med en gang. 
5. Sjekker at alt ser bra ut og sender sperringen. 
#### Sperre en enkelt elev/undervisningsgruppe frem i tid
1. Lærer søker opp undervisningsgruppen.
2. Velger enten å sperre enkelt elever eller helle gruppen. 
3. Velger hvilke sperringer som skal settes.
4. Velger tidspunkt for sperring ved å velge dag og tidspunkt i kalenderen. 
5. Sjekker at alt ser bra ut og sender sperringen. 

### Superbruker
#### Sperre en enkelt elev/undervinsinsgruppe for en lærer
1. Superbruker søker opp undervisningsgruppen.
2. Velger enten å sperre enkelt elever eller helle gruppen. 
3. Velger hvilke sperringer som skal settes.
4. Velger tidspunkt for sperring ved å velge dag og tidspunkt i kalenderen. 
5. Sjekker at alt ser bra ut og sender sperringen. 

# create-svelte

Everything you need to build a Svelte project, powered by [`create-svelte`](https://github.com/sveltejs/kit/tree/main/packages/create-svelte).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npm create svelte@latest

# create a new project in my-app
npm create svelte@latest my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.
