<script>
	import { onMount } from "svelte"
	import { get } from "svelte/store"
	import { goto } from "$app/navigation"
	import IconSpinner from "../lib/components/IconSpinner.svelte"
	import { prettyPrintBlock } from "../lib/helpers/pretty-block-type"
	import { prettyPrintDate } from "../lib/helpers/pretty-date"
	import { superUserImposter } from "../lib/store.js"
	import { getClasses, getExtendedUserInfo, getNettsperreToken, getStudents, postBlock } from "../lib/useApi.js"

	let showStudents = []
	let showBlock = []
	let showStudentsState = []
	let divAlreadyOpen = []
	let missingFields = []
	let token
	$: processing = false
	$: blockResponse = null
	$: isMissingFields = false
	$: imposting = ""
	$: requestor = ""

	onMount(async () => {
		token = await getNettsperreToken(true)
		imposting = get(superUserImposter)
		requestor = await getExtendedUserInfo(token.upn)
	})

	const myClasses = async (upn) => {
		return await getClasses(upn)
	}

	const myStudents = async (classId) => {
		return await getStudents(classId)
	}

	const showStudentDiv = (i) => {
		divAlreadyOpen[i] = !divAlreadyOpen[i]
		if (divAlreadyOpen && showBlock[i]) {
			// State for handling div visibility
			showBlock[i] = !showBlock[i]
		}
		// State for handling div visibility
		showStudents[i] = !showStudents[i]
		// State for handling button text
		showStudentsState[i] = !showStudentsState[i]
	}

	const showBlockDiv = (i) => {
		divAlreadyOpen[i] = !divAlreadyOpen[i]
		if (divAlreadyOpen && showStudents[i]) {
			// State for handling div visibility
			showStudents[i] = !showStudents[i]
			// State for handling button text
			showStudentsState[i] = !showStudentsState[i]
		}
		// State for handling div visibility
		showBlock[i] = !showBlock[i]
	}

	const submitBlock = async (classes, i) => {
		let blockObject = {
			status: "pending",
			students: [],
			teacher: {
				teacherId: imposting.length !== 0 ? imposting.teacher.id : token.oid,
				userPrincipalName: imposting.length !== 0 ? imposting.teacher.userPrincipalName : token.upn,
				displayName: imposting.length !== 0 ? imposting.teacher.displayName : token.name,
				officeLocation: imposting.length !== 0 ? imposting.teacher.officeLocation : requestor.data.officeLocation
			},
			blockedGroup: classes[i],
			typeBlock: {
				type: undefined,
				groupId: "undefined"
			},
			createdBy: {
				userId: token.oid,
				userPrincipalName: token.upn,
				displayName: token.name,
				officeLocation: requestor.data.officeLocation
			},
			startBlock: undefined, // Timestamp
			endBlock: undefined, // Timestamp
			createdTimeStamp: undefined, // Timestamp
			updated: [
				// {
				//     timestamp: 'undefined', // Timestamp
				//     updatedBy: {
				//         userId: 'undefined',
				//         userPrincipalName: 'undefined',
				//         displayName: 'undefined',
				//     }
				// }
			]
		}
		if (document.querySelectorAll('input[name="selectedStudents"]:checked').length > 0) {
			document.querySelectorAll('input[name="selectedStudents"]:checked').forEach((e) => {
				blockObject.students.push(JSON.parse(e.value))
			})
		} else if (showBlock[i]) {
			// Get the students from the selected class to block then add them to the blockObject.students array
			const students = await myStudents(classes[i].id)
			students.data.forEach((student) => {
				blockObject.students.push(student)
			})
		}

		if (document.querySelector('input[name="radioGroup"]:checked')?.value === "Eksamensmodus") {
			blockObject.typeBlock.type = "eksamen"
		} else if (document.querySelector('input[name="radioGroup"]:checked')?.value === "fullBlock") {
			blockObject.typeBlock.type = "fullBlock"
		} else if (document.querySelector('input[name="radioGroup"]:checked')?.value === "formsFile") {
			blockObject.typeBlock.type = "formsFile"
		} else if (document.querySelector('input[name="radioGroup"]:checked')?.value === "forms") {
			blockObject.typeBlock.type = "forms"
		}
		blockObject.startBlock = document.getElementById("startTime")?.value
		blockObject.endBlock = document.getElementById("endTime")?.value

		// Reset the isMissingFields state
		isMissingFields = false
		// Check if all fields are filled out
		if (blockObject.typeBlock.type === undefined || blockObject.startBlock === "" || blockObject.endBlock === "" || blockObject.students.length <= 0) {
			isMissingFields = true
			missingFields = []
			if (blockObject.students.length <= 0) {
				missingFields.push("Du må velge minst en elev som skal sperres.")
			}
			if (blockObject.typeBlock.type === undefined) {
				missingFields.push("Du må velge en sperremodus.")
			}
			if (blockObject.startBlock === "") {
				missingFields.push("Du må velge et start tidspunkt.")
			}
			if (blockObject.endBlock === "") {
				missingFields.push("Du må velge et slutt tidspunkt.")
			}
		}
		if (isMissingFields === false) {
			try {
				processing = true
				blockObject.createdTimeStamp = new Date().toISOString()
				blockResponse = await postBlock(blockObject)
				processing = false
			} catch (error) {
				blockResponse = error
			}
		}
	}

	const closeBlock = (i) => {
		if (divAlreadyOpen && showStudents[i]) {
			// State for handling div visibility
			showStudents[i] = !showStudents[i]
			// State for handling button text
			showStudentsState[i] = !showStudentsState[i]
		}
		if (divAlreadyOpen && showBlock[i]) {
			// State for handling div visibility
			showBlock[i] = !showBlock[i]
		}
	}
	const reloadPage = () => {
		// Reset states
		blockResponse = null
		showStudents = []
		showBlock = []
		showStudentsState = []
		divAlreadyOpen = []
		missingFields = []

		const thisPage = window.location.pathname

		goto("/").then(() => goto(thisPage))
	}
</script>

<main>
    {#if blockResponse?.status !== 201 && blockResponse !== null}
        <div class="dbResponse">
            <h1>Noe gikk galt</h1>
            <div>
                <p>Det skjedde en feil under sperringen av klassen. Vennligst prøv igjen.</p>
                <div class="errorMsg">
                    <p>
                        {blockResponse?.message ? blockResponse.message : 'Ukjent feil'}
                    </p>
                </div>
                <div class="errorStack">
                    <p>
                        {blockResponse?.stack ? blockResponse.stack : 'Ukjent feil'}
                    </p>
                </div>
                <div class="center">
                    <button on:click={ () => reloadPage()}>Prøv igjen</button>
                </div>
            </div>
        </div>
    {:else if blockResponse?.status === 201 && blockResponse !== null}
    <div class="dbResponse">
        <h1>Sperringen er opprettet</h1>
        <div class="blockInfo">
            <p>Sperringen av klassen: <strong>{blockResponse.data.blockedGroup.displayName}</strong> er nå opprettet.</p>
            <p>Type sperring: <strong>{prettyPrintBlock(blockResponse.data.typeBlock.type)}</strong></p>
            <p>Sperringen vil vare fra: <strong>{prettyPrintDate(blockResponse.data.startBlock)}</strong> til <strong>{prettyPrintDate(blockResponse.data.endBlock)}</strong></p>
            <p>Antall elever satt i sperring: <strong>{blockResponse.data.students.length}</strong></p>
            <br>
            <p>Ønsker du å gjøre endringer i sperringen eller se flere detaljer kan du gjøre det ved å trykke på "Se sperringer"</p>
        </div>
        <div class="center" style="gap: 0.5rem">
            <button on:click={ () => reloadPage()}>Tilbake til dine klasser</button>
            <button on:click={ () => goto('/sperringer')}>Se dine sperringer</button>
        </div>
    </div>
    {:else}
        <h1>Dine klasser</h1>
        {#if imposting.length !== 0}
            <h3 style="color: red;">Du er logget inn som: {imposting.teacher.userPrincipalName}</h3>
        {/if}
        <div class="classRow header">
            <div class="classInfo"><h3>Klasse</h3></div>
            <div class="classAction"><h3>Handlinger</h3></div>
        </div>
        <hr>
        {#await getNettsperreToken(true)}
            <div class="center">
                <IconSpinner/>
            </div>
        {:then token}
            {#await myClasses(imposting.length !== 0 ? imposting.teacher.userPrincipalName : token.upn)}
                <div class="center">
                    <IconSpinner/>
                </div>
            {:then response} 
                {#each response.data as classes, i}
                    <div class="classRow">
                        <div class="classInfo">
                            {classes.displayName}
                        </div>
                        <div class="classAction">
                            <button disabled={processing ? processing : processing} on:click={() => showStudentDiv(i)}>{showStudentsState[i] ? 'Skjul elever' : 'Vis elever'}</button>   
                            <button disabled={processing ? processing : processing} on:click={() => showBlockDiv(i)}>Sett hele klassen i sperre</button>
                        </div>
                    </div>
                    <div class="studentDiv">
                        {#await myStudents(classes.id)}
                            <div class="center">
                                <IconSpinner/>
                            </div>
                        {:then students}
                            {#if showStudents[i]}
                                {#if processing}
                                    <h3 class="center">Håndterer sperringen</h3>
                                    <div class="center">
                                        <IconSpinner/>
                                    </div> 
                                {:else}
                                    <h3>Velg den/de elevene du ønsker å sette i sperremodus.</h3>
                                    <div class="studentRow">
                                        {#each students.data as student, j}
                                            <div class="ck-button">
                                                <label>
                                                    <input type="checkbox" id="checkbox" name="selectedStudents" value={JSON.stringify(student)}><span>{student.displayName}</span>
                                                </label>
                                            </div>
                                        {/each}
                                    </div>
                                {/if}
                            {/if}
                            {#if showBlock[i]}
                                {#if processing}
                                    <h3 class="center">Håndterer sperringen</h3>
                                    <div class="center">
                                        <IconSpinner/>
                                    </div> 
                                {:else}
                                    <div class="blockClass">
                                        <h3>Du vil nå sette hele klassen i sperremodus.</h3>
                                        <div class="blockClassContent">
                                            <p><strong>Dette vil påvirke {students.data.length} elever.</strong></p>
                                        </div>
                                    </div>
                                {/if}
                            {/if}
                        {/await}          
                    </div>
                    <div class={processing ? "blockSettingsDisabled" : "blockSettings"}>
                        {#if showBlock[i] || showStudents[i]}
                        <h3>Velg den sperremodusen du ønsker å bruke.</h3>
                        <div class="blockSelection">
                            {#if import.meta.env.VITE_DISABLE_EKSAMEN !== 'true'}
                                <div>
                                    <input type="radio" disabled={processing ? processing : processing} id="radio1" name="radioGroup" value="Eksamensmodus">
                                    <label for="radio1">Eksamen med eksamenshjelpemidler</label>
                                </div>
                            {/if}
                            <!-- <input type="radio" id="radio2" name="radioGroup" value="option2">
                            <label for="radio2" value="">Prøvemodus</label> -->
                            {#if import.meta.env.VITE_DISABLE_FULLBLOCK !== 'true'}    
                                <div>
                                    <input type="radio" disabled={processing ? processing : processing} id="radio3" name="radioGroup" value="fullBlock">
                                    <label for="radio3">Ingen internett tilgang</label>
                                </div>
                            {/if}
                            {#if import.meta.env.VITE_DISABLE_FORMS !== 'true'}
                                <div>
                                    <input type="radio" disabled={processing ? processing : processing} id="radio4" name="radioGroup" value="forms">
                                    <label for="radio4">{import.meta.env.VITE_FORMS_OPTION_TEXT}</label>
                                </div>
                            {/if}
                            {#if import.meta.env.VITE_DISABLE_FORMS_FILE !== 'true'}
                                <div>
                                    <input type="radio" disabled={processing ? processing : processing} id="radio5" name="radioGroup" value="formsFile">
                                    <label for="radio5">{import.meta.env.VITE_FORMSFILE_OPTION_TEXT}</label>
                                </div>
                            {/if}
                            <div>

                            </div>
                            <p class="infoText"> {@html import.meta.env.VITE_INFOBOX_TEXT} </p>
                            <div class="alert">
                                <p>Husk at elevene må starte maskinen på nytt for at sperring skal virke, og når de skal ut av sperring.</p>
                            </div>
                        </div>
                        <h3>Velg tidspunkt for sperringen.</h3>
                        <div class="dateTimePicker">
                            <label for="startTime">Start tidspunkt:</label>
                            <input type="datetime-local" disabled={processing ? processing : processing} id="startTime" name="startTime">
                            <label for="endTime">Slutt tidspunkt:</label>
                            <input type="datetime-local" disabled={processing ? processing : processing} id="endTime" name="endTime">
                        </div>
                        {#if isMissingFields}
                            <div class="center" style="color: var(--nype)"><strong>Du må fylle ut alle feltene før du kan sette sperringen ⛔</strong></div>
                            <ul>
                                {#each missingFields as field}
                                <div class="center">
                                    <ul>⛔ <strong style="color: var(--nype)">{field}</strong> ⛔</ul>
                                </div>
                                {/each}
                            </ul>
                        {/if}
                        <div class="centerButtons">
                            <button disabled={processing ? processing : processing} on:click={ async () => submitBlock(await response.data, i)}>Sett sperremodus</button>
                            <button disabled={processing ? processing : processing} on:click={ () => closeBlock(i)}>Avbryt</button>
                        </div>
                        {/if}
                    </div>  
                    <hr>
                {/each}
            {/await}
        {/await}
    {/if}
</main>

<style>
    .classRow {
		display: flex;
		align-items: center;
		padding: 1rem 2rem;
		gap: 0.5rem;
	}
	.classRow.header {
		padding: 1rem 2rem 0 2rem;
	}
    .center {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: center;
    }
    .classInfo {
		width: 15rem;
	}
    .classAction {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        gap: 0.3rem;
		position: relative;
		margin-left: auto;
	}
    .studentDiv {
        display: flex;
        flex-direction: column;
        padding: 0 2.5rem;
    }
    .studentRow {
        align-items: center;
		padding: 1rem;
		gap: 0.1rem;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
    }
    .blockSelection {
        display: flex;
        flex-direction: column;
        flex-wrap: wrap;
        padding: 1rem;
        gap: 0.5rem;
    }
    .blockSettings {
        display: flex;
        flex-direction: column;
        padding: 0 2.5rem;
    }
    .blockSettingsDisabled {
        display: flex;
        color: grey;
        background-color: rgb(0, 0, 0, .2);
        flex-direction: column;
        padding: 0 2.5rem;
    }
    .dateTimePicker {
        display: flex;
        flex-direction: row;
        padding: 1rem;
        gap: 0.5rem;
    }
    .centerButtons {
        display: flex;
        flex-direction: row;
        justify-content: center;
        padding: 1rem;
        gap: 0.5rem;
    }

    .ck-button {
        all: unset;
        border: 1px solid black;
        border-radius: 0.5rem;
        display: flex;
        margin: 0.5rem;
        cursor: pointer;
    }

    .ck-button label {
        float:left;
        cursor: pointer;
    }

    .ck-button label span {
        text-align:center;
        padding: 1rem;
        display:block;
    }

    .ck-button label input {
        /* 
            Display none to avoid the focus onto the label that was out of sight on top of the page. 
            The focus was the reason for scrolling to the top of the page for each press 🤡 
        */
        /* position:absolute;
        top:-1rem */
        display: none;
    }
    span {
        border-radius: 0.5rem;
    }
    .ck-button input:checked + span {
        background-color: var(--gress-90);
    }

    .blockClass {
        display: flex;
        flex-direction: column;
    }
    .blockClassContent {
        display: flex;
        flex-direction: row;
        padding: 1rem;
        gap: 0.5rem;
    }
    .dbResponse {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 1rem;
        border-radius: 5px;
    }

    .errorMsg {
        margin: 1rem;
        padding: 1rem;
        background-color: var(--nype-20);
        border-radius: 5px;
        overflow: auto;
    }

    .errorStack {
        padding: 1rem;
        margin: 1rem;
        background-color: var(--nype-20);
        border-radius: 5px;
        max-height: 200px;
        overflow: auto;
    }

    /*a:link, a:visited {
        padding: 4px;
        cursor: pointer;
        background-color: var(--himmel-20);
        border: 1px solid black;
        border-radius: 5px;
        text-align: center;
        text-decoration: none;
        display: inline-block;
    }

    a:hover, a:active {
        background-color: var(--himmel-30);
    }*/

    .blockInfo {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 1rem;
        background-color: var(--gress-60);
    }

    .alert {
        border: 1px solid var(--nype);
        border-radius: 5px;
        padding: 1rem;
        background-color: var(--nype-20);
        font-weight: bold;
    }
    .infoText {
        border: 1px solid var(--vann);
        border-radius: 5px;
        padding: 1rem;
        background-color: var(--vann-10);
    }
</style>