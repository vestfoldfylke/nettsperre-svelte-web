<script>
	const county = import.meta.env.VITE_COUNTY

	const digitalExamUrl = county === "Telemark" ? "https://eksamen.telemarkfylke.no/elev" : "https://eksamen.vestfoldfylke.no/elev"
</script>

<main>
    <h1>Velkommen til hjelpesiden</h1>
    <p>Her finner du informasjon om nettsperre, mer info kommer.</p><br />
    <h2>Eksamenssperre</h2>
    <h3>Tilgang til samme godkjente hjelpemidler som på eksamen</h3>
    <br>
    <p>Denne varianten av nettsperre gir eleven tilgang til kun de nettbaserte hjelpemidlene som ligger på både sentralt bestemt og lokal liste over godkjente hjelpemidler til eksamen.</p><br>
    {#if county === "Vestfold"}
        <p>Mer informasjon om Nettsperre finner du <a href="https://vestfoldfylke.sharepoint.com/sites/innsida-stottefunksjoner/SitePages/NettsperreOF.aspx" target="_blank">her</a></p><br>
        <p>Informasjon om FileSender finner du <a href="https://vestfoldfylke.sharepoint.com/sites/innsida-stottefunksjoner/SitePages/Filesender.aspx" target="_blank">her</a></p><br>
    {/if}
    <p><strong>Når nettsperre aktiveres, vil elevene ha tilgang til:</strong></p>
    <ul>
        <li>Nettbaserte hjelpemidler til eksamen. Trykk <a href="{digitalExamUrl}" target="_blank">her</a> for å se hvilke hjelpemidler det gjelder.</li>
        <li>Teams klassenotatblokk som er åpnet og synkronisert med OneNote lokalt på PC.</li>
        <li>Filer i OneDrive som allerede er synkronisert og lagret lokalt på PC.</li>
        <li>OneNote som allerede er synkronisert og lagret lokalt på PC.</li>
    </ul>
    <br>
    <p><strong>Elevene vil ikke ha tilgang til andre nettressurser, inklusiv:</strong></p>
    <ul>
        <li>Oppgaveverktøy i Teams.</li>
        <li>Ikke-godkjente nettsider.</li>
        <li>Teams chat.</li>
        <li>Å publisere nye innlegg i Teams-kanal.</li>
        <li>Usynkroniserte filer i Teams.</li>
        <li>Å synkronisere nye og endrede filer til OneDrive.</li>
        <li>Kommunikasjonsapplikasjoner (slik som Discord og Skype).</li>
    </ul>
    
</main>

<style>
    ul {
        padding-left:2rem;
    }
</style>