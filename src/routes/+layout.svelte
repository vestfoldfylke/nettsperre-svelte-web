<script>
	import "../app.css"
	import { onMount } from "svelte"
	import { goto } from "$app/navigation"
	import { page } from "$app/stores"
	import favTFK from "$lib/assets/favicon-32x32.png"
	import logoTFK from "$lib/assets/logo.svg"
	import logoVFK from "$lib/assets/VFK_logo.svg"
	import favVFK from "$lib/assets/vestfold-favicon-32x32.png"
	import { getMsalClient, login } from "../lib/auth/msal-auth.js"
	import IconSpinner from "../lib/components/IconSpinner.svelte"
	import { getNettsperreToken } from "../lib/useApi.js"

	let account = null

	onMount(async () => {
		const authenticate = async () => {
			const msalClient = await getMsalClient()
			if (msalClient.getActiveAccount()) {
				account = msalClient.getActiveAccount()
				// console.log('Active account:', account)
			}
			if (!account) {
				const loginResponse = await login(false, $page.url.pathname) // Sends you to ms auth, and redirects you back here with the msalClient set with active account
				account = loginResponse.account
				if ($page.url.pathname !== loginResponse.loginRequestUrl) {
					goto(loginResponse.loginRequestUrl, { replaceState: false, invalidateAll: true })
				}
			}
		}
		authenticate()
		return () => {
			// console.log('Destroy')
			// on destroy (probably just wipe state)
		}
	})

	const appTitle = "Nettsperre"
	let logo = ""
	let iconPath = ""
	if (import.meta.env.VITE_COUNTY === "Telemark") {
		logo = logoTFK
		iconPath = favTFK
	} else {
		logo = logoVFK
		iconPath = favVFK
	}

	const isActiveRoute = (route, currentRoute) => {
		if (currentRoute === route) return true
		return route.length > 1 && currentRoute.substring(0, route.length) === route
	}

	const getInitials = (name) => {
		const firstInitial = name.substring(0, 1)
		const nameList = name.split(" ")
		if (nameList.length < 2) return firstInitial
		const lastInitial = nameList[nameList.length - 1].substring(0, 1)
		return `${firstInitial}.${lastInitial}`
	}

	$: sideMenuItems = [
		{
			title: "Hjem",
			href: "/",
			icon: "home"
		},
		{
			title: "Sperringer",
			href: "/sperringer",
			icon: "gpp_bad"
		},
		{
			title: "Historikk",
			href: "/historikk",
			icon: "history"
		},
		{
			title: "Hjelp",
			href: "/hjelp",
			icon: "help"
		}
		// {
		//   title: 'Admin',
		//   href: '/admin',
		//   icon: 'admin_panel_settings'
		// },
		// {
		//   title: 'Bruker Admin',
		//   href: '/bruker-admin',
		//   icon: 'supervisor_account'
		// }
	]
	const checkRoles = async (token) => {
		if (token?.roles.includes("nettsperre.admin")) {
			sideMenuItems.push({
				title: "Admin",
				href: "/admin",
				icon: "admin_panel_settings"
			})
		}
		if (token?.roles.includes(`nettsperre.${import.meta.env.VITE_SUPERUSER_ROLE}`)) {
			sideMenuItems.push({
				title: "Brukeradmin",
				href: "/bruker-admin",
				icon: "supervisor_account"
			})
		}
	}
</script>


<svelte:head>
    <link rel="icon" type="image/svg" href={iconPath} />
    <title>{appTitle}</title>
</svelte:head>
{#if !account}
  <div class="loading">
    <IconSpinner width={"32px"} />
  </div>
{:else}
  {#await getNettsperreToken(true)}
    <div class="loading">
      <IconSpinner width={"32px"} />
    </div>
  {:then token}
    {#await checkRoles(token)}
      <div class="loading">
        <IconSpinner width={"32px"} />
      </div>
    {:then _}
      {#if token.roles.length === 0}
        <div class="contentContainer">
          <h1>Hei, {token.name}!</h1>
          <h3>Du har ikke tilgang til denne applikasjonen.</h3>
          <h3>Kontakt servicedesk på din lokasjon om du trenger tilgang</h3>
        </div>
      {:else}
        <div class="layout">
          <div class="fakesidebartotakeupspace">
            <p>Jeg burde ikke synes</p>
          </div>
          <div class="sidebar">
            <a class="logoLink inward-focus-within" href="/">
              <img class="logo" src={logo} alt="Fylkekommunens logo" />
            </a>
            {#each sideMenuItems as menuItem}
              <a href={menuItem.href} class="menuLink inward-focus-within">
                <div class="menuItem{isActiveRoute(menuItem.href, $page.url.pathname) ? ' active' : ''}">
                  <span class="material-symbols-outlined">{menuItem.icon}</span>
                  <div>{menuItem.title}</div>
                </div>
              </a>
            {/each}
          </div>
          <!-- MOBILE MENU -->
          <div class="menubarMobile">
            {#each sideMenuItems as menuItem}
              <a href={menuItem.href} class="menuLinkMobile inward-focus-within">
                <div class="menuItemMobile{isActiveRoute(menuItem.href, $page.url.pathname) ? ' active' : ''}">
                  <span class="material-symbols-outlined">{menuItem.icon}</span>
                  <div>{menuItem.title}</div>
                </div>
              </a>
            {/each}
          </div>
          <!-- END MOBILE MENU -->
          <div class="pageContent">
            <div class="topbar">
              <h1>Nettsperre</h1>
              <div class="userContainer">
                <div class="displayName">
                  <span>
                    {account.name}
                  </span>
                    <!-- {'Rådgiver'} -->
                </div>
                <div class="displayNameMobile">
                  <span>
                    {getInitials(account.name)}
                  </span>
                </div>
              </div>
            </div>
            <div class="contentContainer">
              <slot></slot>
            </div>
          </div>
        </div>
      {/if}
    {/await}
  {/await}
{/if}

<style>
  .contentContainer {
    padding: 1rem 4rem;
  }
  /*.content {
    margin: 0 auto 0 auto;
  }*/
  .layout {
    display: flex;
  }
  .fakesidebartotakeupspace, .sidebar {
    width: 8rem;
    flex-direction: column;
    flex-shrink: 0;
    align-items: center;
    padding: 1.5rem 0;
    display: flex;
    height: 100%;
    background-color: var(--vann-30);
  }
  .sidebar {
    position: fixed;
  }
  .menubarMobile {
    display: none;
  }
  .logoLink {
    padding-bottom: 2rem;
  }
  .logo {
    width: 8rem;
  }
  .menuLink, .menuLinkMobile, .logoLink {
    /*border-bottom: 1px solid var(--primary-color);*/
    text-decoration: none;
    color: var(--font-color);
  }
  .menuItem {
    width: 8rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1rem 0;
    cursor: pointer;
  }
  .menuItem span {
    font-size: 1.5rem;
  }
  .menuItem.active, .menuItemMobile.active {
    font-weight: bold;
    background-color: var(--vann-40);
  }
  .menuItem:hover, .menuItemMobile:hover {
    background-color: var(--vann-10);
  }
  .pageContent {
    flex-grow: 1;
    max-width: 80rem;
    margin: 0 auto;
    padding: 0;
  }
  .topbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 2rem;
    border-bottom: 2px solid var(--vann-30);
  }
  .userContainer .displayName, .displayNameMobile {
    display: flex;
    flex-direction: column;
  }

  /* Smaller devices */
  @media only screen and (max-width: 768px) {
    .fakesidebartotakeupspace, .sidebar {
      display: none;
    }
    .menubarMobile {
      z-index: 100;
      position: fixed;
      bottom: 0;
      align-items: center;
      justify-content: space-between;
      display: flex;
      width: 100vw;
      background-color: var(--vann-30);
      overflow: scroll;
    }
    .menuLinkMobile {
      flex-grow: 1;
    }
    .menuItemMobile {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 1rem 1rem;
      cursor: pointer;
    }
    .menuItem span {
      font-size: 1.5rem;
    }
    .topbar {
      padding: 0 1rem;
    }
    .contentContainer {
      padding: 1rem 1rem 5rem 1rem;
    }
    /*.pathtracker {
      padding: 0.4rem 1rem;
    }*/
    .userContainer .displayName {
      display: none;
    }
    .userContainer .displayNameMobile {
      display: flex;
    }
  }
</style>