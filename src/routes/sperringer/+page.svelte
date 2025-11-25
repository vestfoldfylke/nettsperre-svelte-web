<script>
	import { onMount } from "svelte"
	import { get } from "svelte/store"
	import { goto } from "$app/navigation"
	import { prettyPrintBlock } from "$lib/helpers/pretty-block-type.js"
	import { prettyPrintDate } from "$lib/helpers/pretty-date.js"
	import { prettyPrintStatus } from "$lib/helpers/pretty-status.js"
	import { superUserImposter } from "$lib/store.js"
	import { deleteBlock, getBlocks, getExtendedUserInfo, getNettsperreToken, getStudents, putBlock } from "$lib/useApi.js"
	import IconSpinner from "../../lib/components/IconSpinner.svelte"
	import Modal from "../../lib/components/Modal.svelte"

	let token
	let showActive = false
	let showPending = false
	let showSchool = false
	let showDetails = []
	let blockedStudents = []
	let allStudents = []
	let studentsToShow = []
	$: detailsData = null
	$: blockResponse = null
	$: showDetailsState = false
	$: editBlockType = false
	$: editBlockDate = false
	$: editBlockStudents = false
	$: processing = false
	$: showModal = false
	$: isDeleteBlock = false
	$: imposting = ""

	onMount(async () => {
		token = await getNettsperreToken(true)
		imposting = get(superUserImposter)
	})

	const getBlocksData = async (status, upn, school) => {
		return await getBlocks(status, upn, school)
	}

	const showActiveBlocks = () => {
		showActive = !showActive
	}

	const showPendingBlocks = () => {
		showPending = !showPending
	}

	const showSchoolBlocks = () => {
		showSchool = !showSchool
	}

	const showDetailsDiv = (i, block) => {
		// State for handling div visibility
		showDetails[i] = !showDetails[i]
		showDetailsState = !showDetailsState
		detailsData = block
	}

	const resetDetailsState = () => {
		showDetailsState = !showDetailsState
	}

	const editField = (field) => {
		if (field === "date") {
			editBlockDate = !editBlockDate
		}
		if (field === "blockType") {
			editBlockType = !editBlockType
		}
		if (field === "students") {
			editBlockStudents = !editBlockStudents
		}
	}

	const saveChanges = async (detailsData) => {
		const updatedObj = {
			updatedBy: {
				displayName: token.name,
				teacherId: token.oid,
				userPrincipalName: token.upn
			},
			updatedTimeStamp: new Date().toISOString(),
			studentsToRemove: [],
			studentsToAdd: [],
			typeBlockChange: {},
			dateBlockChange: {
				start: {},
				end: {}
			}
		}

		// Changes made to the data
		if (document.querySelectorAll('input[name="selectedStudents"]:checked').length > 0) {
			document.querySelectorAll('input[name="selectedStudents"]:checked').forEach((e) => {
				// If the student is already in the list of students blocked, add them to the list of students to remove.
				const studentsSelected = JSON.parse(e.value)
				for (const blocked of detailsData.students) {
					if (studentsSelected.id === blocked.id) {
						updatedObj.studentsToRemove.push(studentsSelected)
					}
				}
				// Only add students to the list of students to add if the status of the block is pending. Cannot add new students to an active block!
				if (detailsData.status === "pending") {
					// Check if the student from studentSelected is not in the list of students already blocked.
					// If they are not, add them to the list of students to add.
					if (!detailsData.students.some((student) => student.id === studentsSelected.id)) {
						updatedObj.studentsToAdd.push(studentsSelected)
					}
				}
			})
		}
		// User should only be able to change the type of the block & startTime if the status is pending.
		if (detailsData.status === "pending") {
			if (document.querySelector('input[name="radioGroup"]:checked').value === "Eksamensmodus") {
				if (detailsData.typeBlock.type === "eksamen") {
					// Do nothing
				} else {
					// Add change to updated object
					updatedObj.typeBlockChange = {
						oldType: detailsData.typeBlock.type,
						newType: "eksamen"
					}
					// Change type to eksamen
					detailsData.typeBlock.type = "eksamen"
				}
			} else if (document.querySelector('input[name="radioGroup"]:checked').value === "fullBlock") {
				if (detailsData.typeBlock.type === "fullBlock") {
					// Do nothing
				} else {
					// Add change to updated object
					updatedObj.typeBlockChange = {
						oldType: detailsData.typeBlock.type,
						newType: "fullBlock"
					}
					// Change type to fullBlock
					detailsData.typeBlock.type = "fullBlock"
				}
			} else if (document.querySelector('input[name="radioGroup"]:checked').value === "formsFile") {
				if (detailsData.typeBlock.type === "formsFile") {
					// Do nothing
				} else {
					// Add change to updated object
					updatedObj.typeBlockChange = {
						oldType: detailsData.typeBlock.type,
						newType: "formsFile"
					}
					// Change type to formsFile
					detailsData.typeBlock.type = "formsFile"
				}
			} else if (document.querySelector('input[name="radioGroup"]:checked').value === "forms") {
				if (detailsData.typeBlock.type === "forms") {
					// Do nothing
				} else {
					// Add change to updated object
					updatedObj.typeBlockChange = {
						oldType: detailsData.typeBlock.type,
						newType: "forms"
					}
					// Change type to forms
					detailsData.typeBlock.type = "forms"
				}
			}
			// Check if the startTime has been changed
			if (document.getElementById("startTime").value !== detailsData.startBlock) {
				updatedObj.dateBlockChange.start = {
					old: detailsData.startBlock,
					new: document.getElementById("startTime").value
				}
			}
		}
		// Check if the endTime has been changed
		if (document.getElementById("endTime").value !== detailsData.endBlock) {
			updatedObj.dateBlockChange.end = {
				old: detailsData.endBlock,
				new: document.getElementById("endTime").value
			}
		}
		await detailsData.updated.push(updatedObj)
		// Post the block to the API
		try {
			processing = true
			blockResponse = await putBlock(detailsData)
			processing = false
		} catch (error) {
			blockResponse = error
		}
	}

	const studentsInBlock = async (detailsData) => {
		blockedStudents = []
		allStudents = []
		const studentsInClass = await getStudents(detailsData.blockedGroup.id)
		for (const student of studentsInClass.data) {
			for (const blockedStudent of detailsData.students) {
				if (student.id === blockedStudent.id) {
					blockedStudents.push(blockedStudent)
				}
			}
		}
		// Remove the students that are already in the block from the list of all students.
		allStudents = studentsInClass.data.filter((student) => !detailsData.students.some((blockedStudent) => blockedStudent.id === student.id))
	}

	/**
	 * Delete the block from the API
	 * @param block - The block to delete
	 * @param action - The action to perform on the block. [delete, deactivate]
	 */
	const postDeleteBlock = async (block, action) => {
		// Delete the block from the API
		if (confirm(`Er du sikker på at du vil ${action === "delete" ? "slette" : "deaktivere"} denne sperringen?`)) {
			try {
				isDeleteBlock = true
				processing = true
				blockResponse = await deleteBlock(block, action)
				processing = false
			} catch (error) {
				blockResponse = error
			}
		}
	}

	const reloadPage = () => {
		// Reset states
		blockResponse = null
		showDetailsState = false
		editBlockType = false
		editBlockDate = false
		editBlockStudents = false
		showActive = false
		showPending = false
		showSchool = false
		showDetails = []
		blockedStudents = []
		allStudents = []

		const thisPage = window.location.pathname

		goto("/sperringer").then(() => goto(thisPage))
	}
	// Sort by date, and show only the blocks that are 7 days ahead of today.
	const sortByDate = (blocks) => {
		const today = new Date()
		const sevenDaysAhead = new Date(today.setDate(today.getDate() + 7))
		return blocks.filter((block) => new Date(block.startBlock) < sevenDaysAhead)
	}

	const showStudents = (block) => {
		// Disable scrolling when modal is open
		document.body.style.overflow = "hidden"
		document.body.style.height = "100%"
		showModal = true
		studentsToShow = block.students
	}
</script>

<main>
    {#if processing}
        <div class="center">
            <IconSpinner/>
        </div>
    {:else}
        <Modal bind:showModal>
            <div slot="header">
                <h1>Elever i klassen</h1>
            </div>
            <div class="grid">
                {#each studentsToShow as students }
                    <div class="students">
                        <span class="material-symbols-outlined">person</span>
                        {students.displayName}
                    </div>
                {/each}   
            </div>     
        </Modal>
        {#if blockResponse?.status !== 200 && blockResponse !== null}
            <div class="dbResponse">
                <h1>Noe gikk galt</h1>
                <div>
                    <p>Det skjedde en feil under redigeringen av sperren. Vennligst prøv igjen.</p>
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
        {:else if blockResponse?.status === 200 && blockResponse !== null}
        <div class="dbResponse">
            {#if !isDeleteBlock}
                <h1>Sperringen er endret</h1>
                <div class="blockInfo">
                    <p>Sperringen av klassen: <strong>{blockResponse.data.blockedGroup.displayName}</strong> er nå oppdatert.</p>
                    {#if blockResponse.data.studentsToRemove?.length > 0}
                        <p>Elever som er fjernet fra sperringen:</p>
                        <ul style="padding-left: 1rem;">
                            {#each blockResponse.data.studentsToRemove as student}
                                <li>{student.displayName}</li>
                            {/each}
                        </ul>
                    {/if}
                    {#if blockResponse.data.studentsToAdd?.length > 0}
                        <p>Elever som er lagt til i sperringen:</p>
                        <ul style="padding-left: 1rem;">
                            {#each blockResponse.data.studentsToAdd as student}
                                <li>{student.displayName}</li>
                            {/each}
                        </ul>
                    {/if}
                    {#if blockResponse.data.typeBlockChange.oldType !== blockResponse.data.typeBlockChange.newType}
                        <p>Type sperring er endret fra: <strong>{prettyPrintBlock(blockResponse.data.typeBlockChange.oldType)}</strong> til <strong>{prettyPrintBlock(blockResponse.data.typeBlockChange.newType)}</strong></p>
                    {/if}
                    {#if blockResponse.data.dateBlockChange.start.old !== blockResponse.data.dateBlockChange.start.new}
                        <p>Start tidspunkt for sperringen er endret fra: <strong>{prettyPrintDate(blockResponse.data.dateBlockChange.start.old)}</strong> til <strong>{prettyPrintDate(blockResponse.data.dateBlockChange.start.new)}</strong></p>
                    {/if}
                    {#if blockResponse.data.dateBlockChange.end.old !== blockResponse.data.dateBlockChange.end.new}
                        <p>Slutt tidspunkt for sperringen er endret fra: <strong>{prettyPrintDate(blockResponse.data.dateBlockChange.end.old)}</strong> til <strong>{prettyPrintDate(blockResponse.data.dateBlockChange.end.new)}</strong></p>
                    {/if}
                    <br>
                    <p>Ønsker du å gjøre endringer i sperringen eller se flere detaljer kan du gjøre det ved å trykke på "Se sperringer"</p>
                </div>
                <div class="center" style="gap: 0.5rem">
                    <button on:click={ () => goto('/')}>Dine klasser</button>
                    <button on:click={ () => reloadPage()}>Dine sperringer</button>
                </div>
            {:else}
                <h1>Sperringen er slettet/avsluttet</h1>
                <div class="blockInfo">
                    <p>Sperringen av klassen: <strong>{blockResponse.data.blockedGroup.displayName}</strong> er nå slettet/avsluttet.</p>
                    <p>Ønsker du å opprette eller endre dine sperringer? </p>
                </div>
                <div class="center" style="gap: 0.5rem">
                    <button on:click={ () => goto('/')}>Dine klasser</button>
                    <button on:click={ () => reloadPage()}>Dine sperringer</button>
                </div>
            {/if}
        </div>
        {:else}
            {#await getNettsperreToken(true)}
                <div class="center">
                    <IconSpinner/>
                </div>
            {:then token}
                {#await getBlocksData('active,pending', imposting.length !== 0 ? imposting.teacher.userPrincipalName : token.upn, null)}
                    <div class="center">
                        <IconSpinner/>
                    </div>
                {:then blocks}
                    {#if showDetailsState}
                        <div>
                            <h3>Rediger sperring</h3>
                            <div class="blockRow header">
                                <div class=infoText>
                                    <p>Trykk på 🖋️ ikonet der du ønsker å redigere. </p>
                                    <p>Når du er ferdig å redigere det feltet du ønsker trykker du på 🔒 for å låse feltet. </p>
                                    <p>Dette er ikke nødvendig for å lagre endringene men heller en liten sikkerhet for deg så du slipper å gjøre uønskede endringer 👍</p>
                                    <p>Når du har gjort alle endringene er det viktig at du trykker på knappen "Lagre endringer" for at endringene skal bli lagret.</p>
                                </div>
                                <div class="blockEditInfo">
                                    <h3>Klasse</h3>
                                    {detailsData.blockedGroup.displayName}
                                </div>
                                <div class="blockEditInfo">
                                    <h3>Antall elever</h3>
                                    {detailsData.students.length}
                                </div>
                                {#if detailsData.status === 'pending'}
                                    <h3>Rediger sperring. <button icon on:click={ () => editField('blockType')}>{editBlockType ? '🔒' : '🖋️'}</button></h3>
                                {:else}
                                    <h3>Type sperring.</h3>
                                {/if}
                                <div class="blockSelection">
                                    {#if import.meta.env.VITE_DISABLE_EKSAMEN !== 'true'}
                                        <div>
                                            <input type="radio" id="radio1" name="radioGroup" value="Eksamensmodus" disabled={!editBlockType} checked={detailsData.typeBlock.type === 'eksamen' ? true : ''}>
                                            <label for="radio1">Eksamen med eksamenshjelpemidler</label>
                                        </div>
                                    {/if}

                                    <!-- <input type="radio" id="radio2" name="radioGroup" value="option2">
                                    <label for="radio2" value="">Prøvemodus</label> -->

                                    {#if import.meta.env.VITE_DISABLE_FULLBLOCK !== 'true'}
                                        <div>
                                            <input type="radio" id="radio3" name="radioGroup" value="fullBlock" disabled={!editBlockType} checked={detailsData.typeBlock.type === 'fullBlock' ? true : ''}>
                                            <label for="radio3">Ingen internett tilgang</label>
                                        </div>
                                    {/if}
                                    {#if import.meta.env.VITE_DISABLE_FORMS !== 'true'}
                                        <div>
                                            <input type="radio" id="radio4" name="radioGroup" value="forms" disabled={!editBlockType} checked={detailsData.typeBlock.type === 'forms' ? true : ''}>
                                            <label for="radio4">Prøve i Forms uten filopplastning og uten eksamenshjelpemidler</label>
                                        </div>
                                    {/if}
                                    {#if import.meta.env.VITE_DISABLE_FORMS_FILE !== 'true'}
                                        <div>
                                            <input type="radio" id="radio5" name="radioGroup" value="formsFile" disabled={!editBlockType} checked={detailsData.typeBlock.type === 'formsFile' ? true : ''}>
                                            <label for="radio5">Prøve i Forms med filopplastning og med eksamenshjelpemidler</label>
                                        </div>
                                    {/if}
                                </div>
                                {#if detailsData.status === 'pending'}
                                    <h3>Rediger tidspunkt for sperringen. <button icon on:click={ () => editField('date')}>{editBlockDate ? '🔒' : '🖋️'}</button></h3>
                                {:else}
                                    <h3>Rediger slutt tidspunkt for sperringen. <button icon on:click={ () => editField('date')}>{editBlockDate ? '🔒' : '🖋️'}</button></h3>
                                {/if}
                                <div class="dateTimePicker">
                                    <label for="startTime">Start tidspunkt:</label>
                                    {#if detailsData.status === 'pending'}
                                        <input type="datetime-local" value={detailsData.startBlock} disabled={!editBlockDate} id="startTime" name="startTime">
                                    {:else}
                                        <input type="datetime-local" value={detailsData.startBlock} disabled={true} id="startTime" name="startTime">
                                    {/if}
                                    <label for="endTime">Slutt tidspunkt:</label>
                                    <input type="datetime-local" value={detailsData.endBlock} disabled={!editBlockDate} id="endTime" name="endTime">
                                </div>
                            </div>
                            <br>
                            {#if detailsData.status === 'pending'}
                                <h3>Velg den/de elevene du ønsker å fjerne fra, eller legge til sperringen. <button icon on:click={ () => editField('students')}>{editBlockStudents ? '🔒' : '🖋️'}</button></h3>
                            {:else}
                                <h3>Velg den/de elevene du ønsker å fjerne fra sperringen. <button icon on:click={ () => editField('students')}>{editBlockStudents ? '🔒' : '🖋️'}</button></h3>
                            {/if}
                            <div class="studentRow" style={editBlockStudents ? "" : "opacity:0.4;"}>
                                {#await studentsInBlock(detailsData)}
                                    <div class="center">
                                        <IconSpinner/>
                                    </div>
                                {:then _} 
                                    {#each blockedStudents as student, j}
                                        <div class="ck-button" style="background-color: var(--gress-90);">
                                            <label>
                                                <input type="checkbox" id="checkbox" name="selectedStudents" value={JSON.stringify(student)} disabled={!editBlockStudents}><span>{student.displayName}</span>
                                            </label>
                                        </div>
                                    {/each}
                                    {#if detailsData.status === 'pending'}
                                        {#each allStudents as student, j}
                                            <div class="ck-button-add">
                                                <label>
                                                    <input type="checkbox" id="checkbox" name="selectedStudents" value={JSON.stringify(student)} disabled={!editBlockStudents}><span>{student.displayName}</span>
                                                </label>
                                            </div>
                                        {/each}
                                    {/if}
                                {/await}
                            </div>
                        </div>
                        <div class="center" style="gap: 0.5rem">
                            <button on:click={ () => saveChanges(detailsData)}>Lagre endringer</button>
                            <button on:click={ () => resetDetailsState()}>Avbryt</button>
                        </div>
                    {:else}
                        {#if blocks.status === 200}
                            {#if get(superUserImposter).length !== 0}
                                <h3 style="color: red;">Du er logget inn som: {imposting.teacher.userPrincipalName}</h3>
                            {/if}
                            <div class="pageHeader">
                                <h1>Dine aktive sperringer</h1>
                                <button on:click={ () => showActiveBlocks()}>{showActive ? 'Skjul aktive sperringer' : 'Se aktive sperringer'}</button>
                            </div>
                            {#if showActive}
                            <!-- Check if any status in blocks array === active  -->
                            {#if blocks.data.some(block => block.status === 'active')}
                                {#each blocks.data as block, i}
                                    {#if block.status === 'active'}
                                        <div class="blockRow header">
                                            <div class="blockEditInfo">
                                                <h3>Klasse</h3>
                                                {block.blockedGroup.displayName}
                                            </div>
                                            <div class="blockEditInfo">
                                                <h3>Antall elever</h3>
                                                {block.students.length}
                                            </div>
                                            <div class="blockEditInfo">
                                                <h3>Fra</h3>
                                                {prettyPrintDate(block.startBlock)}
                                            </div>
                                            <div class="blockEditInfo">
                                                <h3>Til</h3>
                                                {prettyPrintDate(block.endBlock)}
                                            </div>
                                            <div class="actionDiv">
                                                <h3>Handlinger</h3>
                                                <div class="classAction">
                                                    <button on:click={ () => showDetailsDiv(i, block)}>Se detaljer/rediger</button>
                                                    <button on:click={ () => postDeleteBlock(block, 'deactivate')}>Deaktiver sperring</button>
                                                </div>
                                            </div>
                                        </div>
                                    {/if}
                                {/each}
                                {:else}
                                    <p style="color: red;">❗Ingen aktive sperringer funnet❗</p>
                            {/if}
                            {/if}
                            <hr>
                            <br>
                            <div class="pageHeader">
                                <h1>Dine fremtidige sperringer</h1>
                                <button on:click={ () => showPendingBlocks()}>{showPending ? 'Skjul fremtidige sperringer' : 'Se fremtidige sperringer'}</button>
                            </div>
                        {#if showPending}
                        {#if blocks.data.some(block => block.status === 'pending')}
                            {#each blocks.data as block, i}
                                {#if block.status === 'pending'}
                                    <div class="blockRow header">
                                        <div class="blockEditInfo">
                                            <h3>Klasse</h3>
                                            {block.blockedGroup.displayName}
                                        </div>
                                        <div class="blockEditInfo">
                                            <h3>Antall elever</h3>
                                            {block.students.length}
                                        </div>
                                        <div class="blockEditInfo">
                                            <h3>Fra</h3>
                                            {prettyPrintDate(block.startBlock)}
                                        </div>
                                        <div class="blockEditInfo">
                                            <h3>Til</h3>
                                            {prettyPrintDate(block.endBlock)}
                                        </div>
                                        <div class="actionDiv">
                                            <h3>Handlinger</h3>
                                            <div class="classAction">
                                                <button on:click={ () => showDetailsDiv(i, block)}>Se detaljer/rediger</button>
                                                <button on:click={ () => postDeleteBlock(block, 'delete')}>Slett sperring</button>
                                            </div>
                                        </div>
                                    </div>
                                {/if}
                                <hr>
                            {/each}
                            {:else}
                                <p style="color: red;">❗Ingen fremtidige sperringer funnet❗</p>
                            {/if}
                        {/if}
                    {:else}
                        <p>Noe gikk galt</p>
                    {/if}
                    {/if}
                {/await}
                {#await getExtendedUserInfo(imposting.length !== 0 ? imposting.teacher.userPrincipalName : token.upn)}
                    <div class="center">
                        <IconSpinner/>
                    </div>
                {:then userInfo} 
                    {#await getBlocksData('active,pending', null, userInfo.data.officeLocation)}
                        <div class="center">
                            <IconSpinner/>
                        </div>
                    {:then blocks}
                        <hr>
                        <br>
                        {#if showDetailsState === false}
                            <div class="pageHeader">
                                <h1>Skolens sperringer</h1>
                                <button on:click={ () => showSchoolBlocks()}>{showSchool ? 'Skjul skolens sperringer' : 'Se skolens sperringer'}</button>
                            </div>
                            {#if showSchool}
                                {#if blocks.data.some(block => ['pending', 'active'].includes(block.status))}
                                    {#each sortByDate(blocks.data) as block, i}
                                        {#if ['pending', 'active'].includes(block.status)}
                                            <div class="blockRow header">
                                                <div class="blockEditInfo">
                                                    <div class="schoolDataGrid">
                                                        <div class="blockEditInfo"> 
                                                            <h3>Klasse</h3>
                                                            {block.blockedGroup.displayName}
                                                        </div>
                                                        <div class="blockEditInfo">
                                                            <h3>Lærer</h3>
                                                            {block.teacher.displayName}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="blockEditInfo">
                                                    <div class="schoolDataGrid">
                                                        <div class="blockEditInfo">
                                                            <h3>Antall elever</h3>
                                                            {block.students.length}
                                                        </div>
                                                        <div class="blockEditInfo">
                                                            <h3>Handling</h3>
                                                            <button on:click={ () => showStudents(block)}>Se Elever</button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="blockEditInfo">
                                                    <div class="schoolDataGrid">
                                                        <div class="blockEditInfo">
                                                            <h3>Fra</h3>
                                                            {prettyPrintDate(block.startBlock)}
                                                        </div>
                                                        <div class="blockEditInfo">
                                                            <h3>Til</h3>
                                                            {prettyPrintDate(block.endBlock)}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="blockEditInfo">
                                                
                                                </div>
                                                <div class="blockEditInfo">
                                                    <h3>Status</h3>
                                                    {prettyPrintStatus(block.status)}
                                                </div>
                                            </div>
                                        {/if}
                                        <hr>
                                    {/each}
                                {:else}
                                    <p style="color: red;">❗Ingen sperringer for {userInfo.data.officeLocation} funnet❗</p>
                                {/if}
                            {/if}
                            <hr>
                        {/if}
                    {/await}
                {/await}        
            {/await}
        {/if}
    {/if}
</main>

<style>
    .pageHeader {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
    }
    .blockRow {
		display: flex;
		align-items: flex-start;
        flex-direction: column;
		gap: 0.5rem;
	}
    .grid {
		display: grid;
        grid-template-columns: repeat(5, 1fr);
        grid-template-rows: repeat(5, 1fr);
        grid-column-gap: 0;
        grid-row-gap: 0;
	}
    .schoolDataGrid {
        display: flex;
        flex-direction: row;
        gap: 0.5rem;
        justify-content: space-around;
        align-items: flex-start;
    }
    .students {
        display: flex;
        flex-direction: row;
        padding: 0.2rem;
        gap: 0.5rem;
    }
	.blockRow.header {
		padding: 1rem 2rem 0 2rem;
	}
    .center {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: center;
    }
    .blockEditInfo {
		width: 25vw;
	}
    .classAction {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        gap: 0.3rem;
		position: relative;
		margin-left: auto;
        padding-bottom: 1rem;
	}

    .actionDiv {
        display: flex;
        flex-direction: column;
        flex-wrap: wrap;
        /* gap: 0.3rem; */
        position: relative;
        margin-left: auto;
    }

    /*.blockDiv {
        display: flex;
        flex-direction: column;
        padding: 0rem 2.5rem;
    }*/

    .studentRow {
        align-items: center;
		padding: 1rem;
		gap: 0.1rem;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
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
        background-color: var(--nype-30);
    }

    .ck-button-add {
        all: unset;
        border: 1px solid black;
        border-radius: 0.5rem;
        display: flex;
        margin: 0.5rem;
        cursor: pointer;
    }

    .ck-button-add label {
        float:left;
        cursor: pointer;
    }

    .ck-button-add label span {
        text-align:center;
        padding: 1rem;
        display:block;
    }

    .ck-button-add label input {
        /* 
            Display none to avoid the focus onto the label that was out of sight on top of the page. 
            The focus was the reason for scrolling to the top of the page for each press 🤡 
        */
        /* position:absolute;
        top:-1rem */
        display: none;
    }

    .ck-button-add input:checked + span {
        background-color: var(--gress-90);
    }

    .blockSelection {
        display: flex;
        flex-direction: column;
        flex-wrap: wrap;
        padding: 1rem;
        gap: 0.5rem;
    }
    .dateTimePicker {
        display: flex;
        flex-direction: row;
        padding: 1rem;
        gap: 0.5rem;
    }
    .infoText {
        padding: 1rem;
        background-color: var(--vann-10);
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
</style>