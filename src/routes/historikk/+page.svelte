<script>
	import { onMount } from "svelte"
	import { get } from "svelte/store"
	import { syntaxHighlight } from "$lib/helpers/highlight-json.js"
	import { prettyPrintDate } from "$lib/helpers/pretty-date.js"
	import { schoolInfoTFK } from "$lib/helpers/tfk-schools.js"
	import { schoolInfoVFK } from "$lib/helpers/vfk-schools.js"
	import { superUserImposter, teachersStore } from "$lib/store.js"
	import { getGroupMembers, getHistory, getNettsperreToken } from "$lib/useApi.js"
	import IconSpinner from "../../lib/components/IconSpinner.svelte"
	import Searchfield from "../../lib/components/Searchfield.svelte"

	let token
	let showDetails = []
	let hideMonthBlock = []
	let history = []
	let groupMembersArray
	let schoolInfo = import.meta.env.VITE_COUNTY === "Telemark" ? schoolInfoTFK : schoolInfoVFK

	let filterObj = {
		teacher: undefined,
		school: undefined,
		class: undefined
	}

	$: imposting = ""
	$: groupedHistory = []
	$: showDetailsState = false
	$: hideMonthState = false
	$: detailsData = null

	onMount(async () => {
		token = await getNettsperreToken(true)
		imposting = get(superUserImposter)
	})

	const checkRoles = async (token) => {
		if (token?.roles.includes(`nettsperre.${import.meta.env.VITE_SUPERUSER_ROLE}`)) {
			// Role not found in token roles array, error true
			console.log("superuser")
		}
	}

	const groupByMonth = async (blocks) => {
		const grouped = {}
		blocks.forEach((block) => {
			const year = block.startBlock.split("-")[0]
			const month = block.startBlock.split("-")[1]
			// If the month is not in the grouped object, add it
			if (!grouped[month]) {
				grouped[month] = { year: year, blocks: [] }
			}
			// If the block is from a previous year, replace the block
			if (grouped[month].year < year) {
				grouped[month] = { year: year, blocks: [block] }
			}
			// If the block is from the same year, add it to the array
			else if (grouped[month].year === year) {
				grouped[month].blocks.push(block)
			}
		})
		// Flatten the grouped object to only contain blocks
		const flattenedGrouped = {}
		Object.keys(grouped).forEach((month) => {
			flattenedGrouped[month] = grouped[month].blocks
		})
		return flattenedGrouped
	}

	// Function to get history data
	const getHistoryData = async (token, filter) => {
		groupedHistory = []
		// Close all open month blocks
		hideMonthBlock = []
		// If the user is a superuser, get history for the selected teacher
		if (token?.roles.includes(`nettsperre.${import.meta.env.VITE_SUPERUSER_ROLE}`)) {
			// If the filter object is not empty, get history for the selected teacher
			if (filter !== undefined && (filter?.teacher !== null || filter?.school !== null)) {
				history = await getHistory(filter?.teacher.userPrincipalName, null, filter?.school.officeLocation)
				groupedHistory = await groupByMonth(history.data || [])
				return groupedHistory
			}

			// If the filter object is empty, get history for the superuser
			history = await getHistory(token.upn, null, null)
			groupedHistory = await groupByMonth(history.data || [])
			return groupedHistory
		}

		// If the user is not a superuser, get history for the user
		history = await getHistory(token.upn, null, null)
		groupedHistory = await groupByMonth(history.data || [])
		// Set a sleep to simulate a slow API
		return groupedHistory
	}

	// Function to show details div
	const showDetailsDiv = (i, block) => {
		// State for handling div visibility
		showDetails[i] = !showDetails[i]
		showDetailsState = !showDetailsState
		// Clear the filter object
		filterObj = {
			teacher: undefined,
			school: undefined,
			class: undefined
		}
		detailsData = block
	}

	// Function to reset the details state
	const resetDetailsState = () => {
		showDetailsState = !showDetailsState
	}

	// Function to get teachers
	const getTeachers = async () => {
		try {
			if (get(teachersStore).length === 0) {
				const teachers = await getGroupMembers()
				groupMembersArray = teachers.data
				teachersStore.set(groupMembersArray)
				return
			}

			groupMembersArray = get(teachersStore)
		} catch (error) {
			console.error(error)
		}
	}

	// Function to hide and show month blocks
	const hideMonth = (i) => {
		hideMonthBlock[i] = !hideMonthBlock[i]
		hideMonthState = !hideMonthState
	}
</script>

<main>
    {#await getNettsperreToken(true)}
        <div class="center">
            <IconSpinner />
        </div>
    {:then token}
        {#await checkRoles(token)}
            <div class="center">
                <IconSpinner />
            </div>
        {:then _} 
            {#await getHistoryData(token)}
                <div class="center">
                    <IconSpinner />
                </div>
            {:then _}
                {#if showDetailsState}
                    {#if token.roles.includes(`nettsperre.${import.meta.env.VITE_SUPERUSER_ROLE}`)}
                        <pre>{@html syntaxHighlight(JSON.stringify(detailsData, null, 2))}</pre>
                        <div class="center">
                            <button on:click={ () => resetDetailsState()}>Tilbake</button>
                        </div>
                    {/if}
                {:else}
                    <div class={token.roles.includes(`nettsperre.${import.meta.env.VITE_SUPERUSER_ROLE}`) ? 'filters' : 'hidden'}>
                        {#if token.roles.includes(`nettsperre.${import.meta.env.VITE_SUPERUSER_ROLE}`)}
                        <h3>Filtrering</h3>
                            {#await getTeachers()}
                                <div class="center"> 
                                    <IconSpinner />
                                </div>
                                <div class="center">
                                    <h3>Henter lærere...</h3>
                                </div>
                            {:then _}
                                <div class="superUserFilter">
                                    <div class="searchFields">
                                        <Searchfield placeHolder="Søk etter lærer" propToFilter="displayName" arrayData={get(teachersStore)} bind:selectedObj={filterObj.teacher}></Searchfield>
                                    </div>
                                    <div class="searchFields"> 
                                        <Searchfield placeHolder="Søk etter skole" propToFilter="officeLocation" arrayData={schoolInfo} bind:selectedObj={filterObj.school}></Searchfield>
                                    </div>
                                </div>
                            {/await}
                        {/if}
                        {#if token.roles.includes(`nettsperre.admin`)}                            
                            <pre>{@html syntaxHighlight(JSON.stringify(filterObj, null, 2))}</pre>
                        {/if}
                        {#if token.roles.includes(`nettsperre.${import.meta.env.VITE_SUPERUSER_ROLE}`)}
                            <div class="center">
                                {#if filterObj.teacher === '' && filterObj.school === ''}
                                    <button disabled on:click={ () => {getHistoryData(token, filterObj)} }>Hent historikk</button>
                                {:else}
                                    <button on:click={ () => {getHistoryData(token, filterObj)} }>Hent historikk</button>
                                {/if}
                            </div>
                        {/if}
                    </div>
                    <h1>Historikk</h1>
                    <div class="infoText">
                        <p>Her kan du se dine tidligere sperringer. Sperringene vil være synlige helt frem til du oppretter en sperre i samme måned som et tidligere år. Om du for eksempel har 10 sperrer i desember 2024 og oppretter en ny sperre i desember 2025 vil kun den nye sperren være synlig for deg.</p>
                        {#if token.roles.includes(`nettsperre.${import.meta.env.VITE_SUPERUSER_ROLE}`)}
                            <br>
                            <p>Som Superbruker har du mulighet til å søke etter sperringer til enkelt lærere eller hele skoler.</p>
                        {/if}
                    </div>
                    {#if groupedHistory?.length === 0}
                        <div class="center">
                            <IconSpinner />
                        </div>
                    {:else}
                        {#if Object.keys(groupedHistory).length === 0}
                            <p>Ingen historikk funnet for bruker: <strong>{filterObj.teacher?.userPrincipalName ? filterObj.teacher.userPrincipalName : token.upn}</strong></p>
                        {:else}
                            <!-- 
                                Sorted to show newest to oldest block. Had to sort here because the Object.entries messed with the order when a 0 was in front.
                                09, 10, 11 turned into 10, 11, 09. Sorting b - a to get newest first. a-b would give oldest first.
                            -->
                            {#each Object.entries(groupedHistory).sort(([a], [b]) => b - a) as [month, blocks], i} 
                                <div class="month-group">
                                    <div class="month-header">
                                        <h2>{(new Date(0, month - 1).toLocaleString('default', { month: 'long' })).charAt(0).toUpperCase() + (new Date(0, month - 1).toLocaleString('default', { month: 'long' })).slice(1)} ({blocks.length})</h2>
                                        {#if hideMonthBlock[i]}
                                            <button class="shownNhide" on:click={ () => {hideMonth(i)}}><span class="material-symbols-outlined">keyboard_arrow_down</span></button>
                                        {:else}
                                            <button class="shownNhide" on:click={ () => {hideMonth(i)}}><span class="material-symbols-outlined">keyboard_arrow_up</span></button>
                                        {/if}
                                    </div>
                                    {#if hideMonthBlock[i]}
                                        {#each blocks as block, i}
                                            <div class="blockRow header">
                                                <div class="blockInfo">
                                                    <h3>Klasse</h3>
                                                    {block.blockedGroup.displayName}
                                                </div>
                                                <div class="blockInfo">
                                                    <h3>Antall elever</h3>
                                                    {block.students.length}
                                                </div>
                                                <div class="blockInfo">
                                                    <h3>Fra</h3>
                                                    {prettyPrintDate(block.startBlock)}
                                                </div>
                                                <div class="blockInfo">
                                                    <h3>Til</h3>
                                                    {prettyPrintDate(block.endBlock)}
                                                </div>
                                                {#if token.roles.includes(`nettsperre.${import.meta.env.VITE_SUPERUSER_ROLE}`)}
                                                    <div class="actionDiv">
                                                        <h3>Handlinger</h3>
                                                        <div class="classAction">
                                                            <button on:click={ () => showDetailsDiv(i, block)}>Se detaljer</button>
                                                        </div>
                                                    </div>
                                                {/if}
                                            </div>
                                            <hr>
                                        {/each}
                                    {/if}
                                </div>
                            {/each}
                        {/if}
                    {/if}
                {/if}
            {/await}
        {/await}
    {/await}  
</main>

<style>
    .hidden {
        display: none;
    }
    .shownNhide {
        background-color: transparent;
        border: none;
        padding: 0.5rem;
        margin: 0.5rem;
    }
    .month-header {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
    }
    .month-group {
        margin: 0.5rem;
    }
    .superUserFilter {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: space-evenly;
    }

    .searchFields {
        padding: 0.5rem;
    }

    /*.selectedFilters {
        padding: 0.5rem;
        border: 1px solid #ccc;
        margin: 0.5rem;
    }*/

    .blockRow {
		display: flex;
		align-items: flex-start;
        flex-direction: column;
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
    .filters {
        /* border: 1px solid black; */
        padding: 0.1rem;
    }
    pre {
        outline: 1px solid #ccc; 
        padding: 0.5rem; 
        margin: 1rem;
    }
    .infoText {
        padding: 0.5rem; 
        margin: 1rem;
        background-color: var(--vann-10);
        font-size: 1.1rem;
    }
</style>