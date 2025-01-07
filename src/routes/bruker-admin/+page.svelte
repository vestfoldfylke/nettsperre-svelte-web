<script>
    import IconSpinner from "../../lib/components/IconSpinner.svelte";
    import { getNettsperreToken, getGroupMembers, validatePermission } from "../../lib/useApi.js";
    import { onMount } from "svelte";
    import { superUserImposter, teachersStore } from "../../lib/store"
    import { get } from "svelte/store";
    import { goto } from '$app/navigation'

    let token
    let groupMembersArray
    $: teachers = ''
    $: errorMsg = ''
    $: searchValue = ''
    $: imposting = ''
    $: error = false
    $: processing = false
    $: success = false

    onMount( async () => {
        token = await getNettsperreToken(true)
        imposting = get(superUserImposter)
    })
    const checkRoles = async (token) => {
        if(token?.roles.includes(`nettsperre.${import.meta.env.VITE_SUPERUSER_ROLE}`)) {
            // Role not found in token roles array, error true
            console.log('superuser')
        }
    }

    const getTeachers = async () => {
        try {
            if(get(teachersStore).length === 0) {
                const teachers = await getGroupMembers()
                groupMembersArray = teachers.data
                teachersStore.set(groupMembersArray)
            } else {
                groupMembersArray = get(teachersStore)
            }
        } catch (error) {
            console.error(error)
        }
    }

    const search = (searchValue) => {
		const filterFunc = (teacher) => {
			const sv = searchValue.toLowerCase()
			return (teacher.displayName.toLowerCase().startsWith(sv) || teacher.userPrincipalName.toLowerCase().startsWith(sv))
		}
		teachers = groupMembersArray.filter(filterFunc)
	}

    const setAdmin = async (requestor, teacher) => {
        const permission = await validatePermission(requestor, teacher.userPrincipalName)
        if(permission.status === 200) {
            superUserImposter.set({
                requestor: requestor,
                teacher: teacher
            })
            goto('/')
            return true
        } else {
            return false
        }
    }

    const resetImposter = () => {
        superUserImposter.set([])
        goto('/')
    }

</script>

<main>
    {#if processing}
    <div class="center">
        <IconSpinner/>
    </div>
    {:else}
        {#if error}
            <div>
                <p>Noe gikk galt om du havner her </p>
            </div>
        {:else}
            {#await getNettsperreToken(true)}
                <div class="center">
                    <IconSpinner/>
                </div>
            {:then token}
                {#await checkRoles(token)}
                    <div class="loading">
                        <IconSpinner width={"32px"} />
                    </div>
                {:then}
                    {#if !token.roles.includes(`nettsperre.${import.meta.env.VITE_SUPERUSER_ROLE}`)}    
                        <div>
                            <p>Du har ikke tilgang til denne siden</p>
                        </div>
                    {:else}
                        {#await getTeachers()}
                            <div>
                                <h1>Hei, {token.name}!</h1>
                                <br>
                                <div class="center">
                                    <h3>Henter lærere...</h3>
                                </div>
                            </div>
                            <div class="center">
                                <IconSpinner/>
                            </div>
                        {:then} 
                            <div>
                                <h1>Hei, {token.name}!</h1>
                                {#if get(superUserImposter).length !== 0}
                                    <h3 style="color: red;">Du er logget inn som: {get(superUserImposter).teacher.userPrincipalName}</h3>
                                    <button on:click={() => resetImposter()}>Fjern administrering</button>
                                {/if}   
                            </div>
                            <br>
                            <div class="icon-input" style="width: 16rem;">
                                <span class="material-symbols-outlined">search</span>
                                <input type="text" bind:value={searchValue} on:input={() => { search(searchValue) }} placeholder="Søk etter lærer" />
                            </div>
                            <br>
                            <div>
                                <div class="teacherRow header">
                                    <div class="teacherInfo">
                                        <h3>
                                            Lærer
                                        </h3>
                                    </div>
                                    <div class="teacherInfo">
                                        <h3>
                                            Skole
                                        </h3>
                                    </div>
                                    <div class="teacherAction">
                                        <h3>
                                            Handling
                                        </h3>
                                    </div>
                                </div>
                                <hr>
                                <br>
                                {#if searchValue.length === 0}
                                <div class="center">
                                    <h3>Søk etter den læreren du vil administrere eller opprette sperringer for.</h3>
                                </div>
                                {:else if teachers.length === 0}
                                    <div class="center">
                                        <h3>Fant ingen lærere med navnet <strong>{searchValue}</strong></h3>
                                    </div>
                                {:else if searchValue.length > 0}
                                    {#each teachers as teacher}
                                    <div class="teacherRow">
                                        <div class="teacherInfo">
                                            <div class="teacherName">
                                                <p>{teacher.displayName}</p>
                                            </div>
                                        </div>
                                        <div class="teacherInfo">
                                            <div class="teacherName">
                                                <p>{teacher.officeLocation}</p>
                                            </div>
                                        </div>
                                        <div class="teacherAction">
                                            <button on:click={() => setAdmin(token.upn, teacher)}>Administrer</button>
                                        </div>
                                    </div>
                                    {/each}
                                {/if}
                            </div>
                        {/await}
                    {/if}
                {/await}
            {/await}
        {/if}
    {/if}
</main>


<style>
    .teacherRow {
		display: flex;
		align-items: center;
		padding: 1rem 2rem;
		gap: 0.5rem;
	}
	.teacherRow.header {
		padding: 1rem 2rem 0rem 2rem;
	}
    .teacherInfo {
		width: 15rem;
	}
    .teacherAction {
		position: relative;
		margin-left: auto;
	}
    .teacherName {
		font-weight: bold;
	}
    .center {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: center;
    }

    .icon-input input {
        padding: 5px 16px 5px 5px;
        border: 1px solid var(--himmel);
        flex-grow: 1;
    }

    .icon-input span {
        padding: 0rem 0rem 0rem 0rem;
        font-size: 1.5rem;
    }

    span.material-symbols-outlined {
        text-decoration: none;
        vertical-align: text-bottom;
    }
</style>