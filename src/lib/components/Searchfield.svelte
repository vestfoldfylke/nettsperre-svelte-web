<script>
	export let arrayData = []
	export let placeHolder = "Søk etter..."
	export let propToFilter = ""
	export let selectedObj = ""

	let highlightedIndex = -1

	$: inputFieldLength = 0
	$: searchValue = ""
	$: searchResult = ""
	$: selectedSearchValue = ""

	const search = (searchValue) => {
		inputFieldLength = searchValue.length
		const filterFunc = (teacher) => {
			const sv = searchValue.toLowerCase()
			return teacher[propToFilter].toLowerCase().startsWith(sv)
		}
		searchResult = arrayData.filter(filterFunc)
	}

	const handleKeydown = async (searchLength, searchArray, event) => {
		if (event.key === "ArrowDown" && searchArray.length > 0 && searchLength > 0) {
			highlightedIndex = (highlightedIndex + 1) % searchArray.length
			// Scroll to the highlighted item
			document.getElementsByClassName("autocomplete-items")[highlightedIndex].scrollIntoView({ behavior: "smooth", block: "center" })
		} else if (event.key === "ArrowUp" && searchArray.length > 0 && searchLength > 0) {
			highlightedIndex = (highlightedIndex - 1 + searchArray.length) % searchArray.length
			// Scroll to the highlighted item
			document.getElementsByClassName("autocomplete-items")[highlightedIndex].scrollIntoView({ behavior: "smooth", block: "center" })
		} else if (event.key === "Enter" && searchArray.length > 0 && searchLength > 0) {
			if (highlightedIndex >= 0 && highlightedIndex < searchArray.length) {
				selectedSearchResult(searchArray[highlightedIndex])
			}
		}
	}

	const selectedSearchResult = (selected) => {
		selectedSearchValue = ""
		selectedSearchValue = selected[propToFilter]
		inputFieldLength = 0
		highlightedIndex = -1
		searchResult = ""
		selectedObj = selected
	}
</script>

<main>
    <div class="inputField">
        <input
            type="text"
            id="search"
            on:input={(e) => search(e.target.value)}
            on:keydown={handleKeydown.bind(null, inputFieldLength, searchResult)}
            value={selectedSearchValue}
            placeholder={placeHolder}
            autocomplete="off"
        />
        {#if selectedSearchValue !== ''}
            <button on:click={() => {selectedSearchValue = ''; inputFieldLength = 0; searchResult = ''; selectedObj = '';}}>X</button>
        {/if}
    </div>
    <ul class="autocomplete-container">
        {#each searchResult as obj, index}
            {#if inputFieldLength === 0}
                <div style="display: none;">{obj}</div>
            {:else}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <div
                    class="autocomplete-items {highlightedIndex === index ? 'autocomplete-active' : ''}"
                    role="button"
                    tabindex="0"
                    on:click={() => {
                        selectedSearchResult(obj, inputFieldLength);
                    }}
                >
                    {#if propToFilter === ''} 
                        {obj} 
                    {:else} 
                        {obj[propToFilter]} 
                    {/if}
                </div>
            {/if}
        {/each}
    </ul>
</main>

<style>
    main {
       width: 75vw;
    }
    ul {
        list-style-type: none;
        padding: 0;
        max-height: 200px;
        overflow-y: auto;
        z-index: 999;
        position: absolute;
        width: inherit;
    }

    button {
        background-color: #f1f1f1;
        border: none;
        padding: 10px;
        font-size: 16px;
        cursor: pointer;
    }

    .inputField {
        display: flex;
        flex-direction: row;
        background-color: #f1f1f1;
        padding: 5px;
        width: inherit;
    }

    input {
        border: 1px solid transparent;
        background-color: #f1f1f1;
        padding: 10px;
        font-size: 16px;
    }

    input[type=text] {
        background-color: #f1f1f1;
        width: 100%;
    }

    .autocomplete-items {
        padding: 10px;
        cursor: pointer;
        background-color: #fff;
        border-bottom: 1px solid #d4d4d4;
    }

    .autocomplete-active {
        /*when navigating through the items using the arrow keys:*/
        background-color: DodgerBlue !important;
        color: #ffffff;
    }

    /*.superUserFilter {
        display: flex;
        flex-direction: column;
        flex-wrap: wrap;
        justify-content: center;
        gap: 0.5rem;
    }*/
</style>