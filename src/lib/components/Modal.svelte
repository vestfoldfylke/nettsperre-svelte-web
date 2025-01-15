<script>
	export let showModal; // boolean
	export let disableClickOutSide = false // boolean
	export let disableStandardButton = false // boolean

	let dialog; // HTMLDialogElement

	$: if (dialog && showModal) dialog.showModal();
	
	const closeModal = () => {
		// Endable scrolling when modal is closed
		document.body.style.height = "auto";
		document.body.style.overflow = "auto";
		dialog.close();
	}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
<dialog bind:this={dialog} on:close={() => (showModal = false)} on:click|self={() => disableClickOutSide ? '' : closeModal()}>
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div on:click|stopPropagation>
		<slot name="header" />
		<hr />
		<slot />
		<div class="mainContent">
			<slot name="mainContent">
			</slot>
		</div>
		<!-- svelte-ignore a11y-autofocus -->
        <div class="buttons">
            <slot name="saveButton"></slot>
			{#if disableStandardButton === false}
				<button autofocus on:click={() => closeModal()}>Avbryt</button>
			{/if}
        </div>
	</div>
</dialog>

<style>
	dialog {
		max-width: 45em;
		border-radius: 0.2em;
		height: fit-content;
        max-height: 41em;
		border: none;
		padding: 0;
		overflow-x: hidden;
	}
	dialog::backdrop {
		background: rgba(0, 0, 0, 0.3);
	}
	dialog > div {
		padding: 1em;
	}
	dialog[open] {
		animation: zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	}
	@keyframes zoom {
		from {
			transform: scale(0.95);
		}
		to {
			transform: scale(1);
		}
	}
	dialog[open]::backdrop {
		animation: fade 0.2s ease-out;
	}
	@keyframes fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
	.mainContent {
		display: flex;
		justify-content: center;
		margin: auto;
		padding: 10px;
		overflow: auto;
		-ms-overflow-style: none;  /* Internet Explorer 10+ */
    	scrollbar-width: none;  /* Firefox */
		max-height:24em;
		margin-bottom: 2em;
	}

	.mainContent::-webkit-scrollbar {
		display: none; /* Safari and Chrome */
	}

    .buttons {
        display: flex;
        margin-top: auto;
		margin-bottom: 10px;
        gap: 1rem;
        flex-wrap: wrap;
        flex-direction: row;
        justify-content: center;
    }

	header {
		padding: 16px;
		/* ... */
	}
	header:empty {
		display: none;
	}
</style>
