## Notes
### Nettsperre
Funksjoner som må på plass i v1.0
1. Opprette sperring på undervisningsgruppe eller enkelt elever frem i tid.

Grupper: (De som er kommentert ut skal vi vente med)
NETTSPERRE-EKSAMEN-MAN
<!-- NETTSPERRE-PROVE-MAN -->
<!-- NETTSPERRE-TEAMS-MAN  -->
NETTSPERRE-OFFLINE-MAN

### Database
Sperringer - inneholder sperringer som venter på å bli aktivert og de som er aktivert. 
Historie - inneholder alle sperringer som er utgått

# Nettsperre
En Webapp med sveltekit. 
Løsningen gir lærere og andre superbrukere mulighet til å sperre undervisningsgrupper og enkelt elever fra ulike løsninger og internett. 

De ulike sperrene: 
1. Prøve. (TBA)
2. Kun tilgang til teams. (TBA)
3. Eksamen.
4. Offline (Ingen tilgang til internett eller andre løsninger).

## Deploye løsningen 
TODO :)
## Beskrivelse av løsningen 
TODO :)
## Frontend
TODO :)
## Backend
TODO :)

## Roller
Kort beskrivelse av de ulike rollene, hva de kan gjøre og generelt hvem som har tilgang til rollene. 

1. Lærer (app.laerer) - default access til appilkasjonen. Læreren har lov til å sette sperre på elevene i sin(e) undervisningsgrupper
2. Superbruker (app.super) - Ledere/Administrasjon/Servicedesk, lov til å sette sperre på elever/undervinsinsgrupper innad på skolen. 
3. Admin (app.admin) - Utviklere, gi mulighet til å logge inn som lærer for å se hvordan ting ser ut for den personen. Logges i mongoDB hvem som har vært inne og og hva som har blitt gjort.

## Usecases
Generell beskrivelse av noen usecaser
### Lærer 
#### Sperre en enkelt elev
1. Lærer søker opp undervisningsgruppen som eleven er medlem av.
2. Velger bort alle elevene og velger kun den/de elevene som skal sperres. 
3. Velger hvilke sperringer som skal settes.
4. Velger ikke å sette et tidspunkt, sperringen vil skje med engang. 
5. Sjekker at alt ser bra ut og sender sperringen. 
#### Sperre en undervisningsgruppe
1. Lærer søker opp undervisningsgruppen.
2. Alle elevene er automatisk valgt. 
3. Velger hvilke sperringer som skal settes.
4. Velger ikke å sette et tidspunkt, sperringen vil skje med engang. 
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
