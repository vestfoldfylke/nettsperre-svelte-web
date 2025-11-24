<script>

</script>

<main>
    <h1>Velkommen til hjelpesiden</h1>
    <p>Her finner du informasjon om nettsperre, mer info kommer.</p><br />
    <h2>Eksamenssperre</h2>
    <h3>Tilgang til samme godkjente hjelpemidler som på eksamen</h3>
    <br>
    <p>Denne varianten av nettsperre gir eleven tilgang til kun de nettbaserte hjelpemidlene som ligger på både sentralt bestemt og lokal liste over godkjente hjelpemidler til eksamen.</p>
    <br>
    <p><strong>Når nettsperre aktiveres, vil elevene ha tilgang til:</strong></p>
    <ul>
        <li>Nettbaserte hjelpemidler til eksamen. 
            Trykk 
            {#if import.meta.env.VITE_COUNTY === 'Telemark'}
            <a href="https://eksamen.telemarkfylke.no/elev">her</a>
            {:else}
            <a href="https://eksamen.vestfoldfylke.no/elev">her</a>
            {/if}
            for å se hvilke hjelpemidler det gjelder.
        </li>
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