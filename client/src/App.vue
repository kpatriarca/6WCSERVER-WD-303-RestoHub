<script setup>
import { ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const searchOpen = ref(false)
const headerSearchText = ref('')
const headerSearchInput = ref(null)

async function openRestaurantSearch() {
  searchOpen.value = true
  await nextTick()
  headerSearchInput.value?.focus()
}

function closeRestaurantSearch() {
  searchOpen.value = false
}

async function submitRestaurantSearch() {
  const searchTerm = headerSearchText.value.trim()

  if (!searchTerm) {
    await openRestaurantSearch()
    return
  }

  searchOpen.value = false

  await router.push({
    path: '/restaurants',
    query: { search: searchTerm },
  })
}
</script>



<template>
  <div class="app">
    <header class="site-header">
      <div class="header-inner">
        <RouterLink to="/" class="brand" aria-label="RestoHub home">
          <img
            src="/assets/favicon.svg"
            alt=""
            class="brand-logo"
          />
          <span>Resto<span class="brand-accent">Hub</span></span>
        </RouterLink>

        <nav aria-label="Main navigation">
          <RouterLink to="/">Home</RouterLink>
          <RouterLink to="/restaurants">Restaurants</RouterLink>
          <RouterLink to="/add-restaurant">Add Restaurant</RouterLink>
          <RouterLink to="/about">About</RouterLink>
        </nav>

        
<div class="header-search-area">
  <form
    v-if="searchOpen"
    class="header-search-form"
    @submit.prevent="submitRestaurantSearch"
  >
    <input
      ref="headerSearchInput"
      v-model="headerSearchText"
      type="search"
      placeholder="Search restaurants..."
      aria-label="Search restaurants"
    />

    <button type="submit" aria-label="Submit search">
      Search
    </button>

    <button
      type="button"
      class="close-search"
      aria-label="Close search"
      @click="closeRestaurantSearch"
    >
      ×
    </button>
  </form>

      <button
          v-else
          type="button"
          class="header-search"
          aria-label="Search restaurants"
          title="Search restaurants"
          @click="openRestaurantSearch"
        >
          <svg
            viewBox="0 0 24 24"
            width="21"
            height="21"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
          >
            <circle cx="10.8" cy="10.8" r="6.8" />
            <path d="m16 16 4.5 4.5" />
          </svg>
        </button>
      </div>
      </div>
    </header>

    <main class="page-content">
      <RouterView />
    </main>

    <footer class="site-footer">
      <RouterLink to="/" class="footer-brand">
        <img src="/assets/favicon.svg" alt="" />
        <strong>RestoHub</strong>
      </RouterLink>
      <p>Restaurant Directory &amp; Database Management System</p>
      <p>&copy; 2026 RestoHub. Built for restaurant discovery.</p>
    </footer>
  </div>
</template>

<style>
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: #f7f5f2;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  color: #201e1b;
}

.site-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #1d1b19;
  color: #fff;
}

.header-inner {
  width: min(1180px, 92%);
  min-height: 58px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  color: #fff;
  text-decoration: none;
  font-size: 19px;
  font-weight: 800;
  letter-spacing: -0.6px;
  white-space: nowrap;
}

.brand-logo {
  width: 34px;
  height: 34px;
  display: block;
  border-radius: 9px;
}

.brand-accent {
  color: #ed7658;
}

.site-header nav {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
}

.site-header nav a {
  padding: 10px 14px;
  border-radius: 8px;
  color: #e6e1dc;
  font-size: 13px;
  text-decoration: none;
  transition: background 0.2s, color 0.2s;
}

.site-header nav a:hover,
.site-header nav a.router-link-active {
  background: #34302c;
  color: #fff;
}

.header-search {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  color: #fff;
  text-decoration: none;
  border-radius: 9px;
}

.header-search:hover {
  background: #34302c;
}

.page-content {
  flex: 1;
  width: min(1180px, 92%);
  margin: 0 auto;
  padding: 38px 0 54px;
}

.site-footer {
  padding: 27px 20px;
  background: #1d1b19;
  color: #c9c2bb;
  text-align: center;
  font-size: 12px;
}

.footer-brand {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  color: white;
  font-size: 16px;
  text-decoration: none;
}

.footer-brand img {
  width: 26px;
  height: 26px;
  border-radius: 7px;
}

.site-footer p {
  margin: 6px 0;
}

.header-search {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: #fff;
  text-decoration: none;
  border-radius: 9px;
  cursor: pointer;
}

.header-search:hover {
  background: #34302c;
}


.header-search-area {
  display: flex;
  align-items: center;
}

.header-search-form {
  display: flex;
  align-items: center;
  gap: 7px;
}

.header-search-form input {
  width: 220px;
  min-width: 0;
  padding: 10px 12px;
  border: 1px solid #51443e;
  border-radius: 7px;
  outline: none;
  background: #fff;
  color: #201e1b;
  font: inherit;
  font-size: 13px;
}

.header-search-form input:focus {
  border-color: #ed7658;
}

.header-search-form button {
  min-height: 36px;
  padding: 8px 12px;
  border: 0;
  border-radius: 7px;
  background: #c94a2f;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.header-search-form .close-search {
  padding: 6px 10px;
  background: #34302c;
  font-size: 18px;
}


@media (max-width: 620px) {
  .header-inner {
    padding: 12px 0;
    flex-wrap: wrap;
    gap: 12px;
  }

  .site-header nav {
    order: 3;
    width: 100%;
    justify-content: flex-start;
  }

  .site-header nav a {
    padding: 9px 10px;
  }

  .header-search {
    margin-left: auto;
  }

  .page-content {
    padding-top: 25px;
  }

  .header-search-area {
    max-width: 100%;
  }

  .header-search-form {
    max-width: 100%;
  }

  .header-search-form input {
    width: 100%;
  }
}
</style>
