<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { restaurantService } from '../services/restaurantService'

const route = useRoute()

const restaurants = ref([])
const loading = ref(true)
const error = ref('')

const search = ref(
  typeof route.query.search === 'string'
    ? route.query.search
    : ''
)

const borough = ref('')
const cuisine = ref('')
const grade = ref('')
const page = ref(1)

const pagination = ref({
  total: 0,
  pages: 1,
})

const metadata = ref({
  boroughs: [],
  cuisines: [],
  grades: [],
})

const showDeleteModal = ref(false)
const selectedRestaurant = ref(null)
const deleting = ref(false)
const deleteError = ref('')

let searchTimer = null

function openDeleteModal(restaurant) {
  if (deleting.value) return

  selectedRestaurant.value = restaurant
  deleteError.value = ''
  showDeleteModal.value = true
}

function closeDeleteModal() {
  if (deleting.value) return

  showDeleteModal.value = false
  selectedRestaurant.value = null
  deleteError.value = ''
}

function handleModalKeydown(event) {
  if (event.key === 'Escape' && showDeleteModal.value) {
    closeDeleteModal()
  }
}

async function loadMetadata() {
  try {
    const response = await restaurantService.getMetadata()

    metadata.value = {
      boroughs: response.data?.boroughs ?? [],
      cuisines: response.data?.cuisines ?? [],
      grades: response.data?.grades ?? [],
    }
  } catch (err) {
    console.error('Could not load filters:', err)
  }
}

async function loadRestaurants() {
  loading.value = true
  error.value = ''

  try {
    const response = await restaurantService.getRestaurants({
      search: search.value.trim(),
      borough: borough.value,
      cuisine: cuisine.value,
      grade: grade.value,
      page: page.value,
      limit: 10,
    })

    restaurants.value = response.data ?? []
    pagination.value = response.pagination ?? {
      total: 0,
      pages: 1,
    }
  } catch (err) {
    error.value = err.message || 'Unable to load restaurants.'
  } finally {
    loading.value = false
  }
}

async function confirmDelete() {
  const restaurant = selectedRestaurant.value

  if (!restaurant?._id || deleting.value) return

  deleting.value = true
  deleteError.value = ''

  try {
    await restaurantService.deleteRestaurant(restaurant._id)

    showDeleteModal.value = false
    selectedRestaurant.value = null

    if (restaurants.value.length === 1 && page.value > 1) {
      page.value--
    }

    await loadRestaurants()
  } catch (err) {
    // Keep the modal open so the user can see the error and retry.
    deleteError.value =
      err.message || 'Unable to delete restaurant.'
  } finally {
    deleting.value = false
  }
}

function applyFilters() {
  page.value = 1
  loadRestaurants()
}

function changePage(nextPage) {
  if (
    nextPage < 1 ||
    nextPage > pagination.value.pages ||
    nextPage === page.value
  ) {
    return
  }

  page.value = nextPage
  loadRestaurants()
}

function formatDate(date) {
  if (!date) return 'Not available'

  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}


watch(search, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(applyFilters, 350)
})

watch(
  () => route.query.search,
  (newSearch) => {
    search.value = typeof newSearch === 'string' ? newSearch : ''
  }
)

onMounted(() => {
  loadMetadata()
  loadRestaurants()
  window.addEventListener('keydown', handleModalKeydown)
})

onBeforeUnmount(() => {
  clearTimeout(searchTimer)
  window.removeEventListener('keydown', handleModalKeydown)
})
</script>



<template>
  <section class="restaurants-page">
    <header class="page-heading">
      <div>
        <h1>Restaurants <span class="read-badge">READ · FIND()</span></h1>
        <p>Browse and manage restaurant records in the database.</p>
      </div>

      <RouterLink class="primary-button" to="/add-restaurant">
        + Add Restaurant
      </RouterLink>
    </header>

    <div class="directory-panel">
      <div class="filters">
        <label class="search-field">
          <span class="sr-only">Search restaurants</span>
          <input
            ref="searchInput"
            v-model="search"
            type="search"
            placeholder="Search by name, borough, or cuisine..."
          />
        </label>

        <label>
          <span class="sr-only">Filter by borough</span>
          <select v-model="borough" @change="applyFilters">
            <option value="">All Boroughs</option>
            <option v-for="item in metadata.boroughs" :key="item" :value="item">
              {{ item }}
            </option>
          </select>
        </label>

        <label>
          <span class="sr-only">Filter by cuisine</span>
          <select v-model="cuisine" @change="applyFilters">
            <option value="">All Cuisines</option>
            <option v-for="item in metadata.cuisines" :key="item" :value="item">
              {{ item }}
            </option>
          </select>
        </label>

        <label>
          <span class="sr-only">Filter by grade</span>
          <select v-model="grade" @change="applyFilters">
            <option value="">All Grades</option>
            <option v-for="item in metadata.grades" :key="item" :value="item">
              Grade {{ item }}
            </option>
          </select>
        </label>

        <button
          v-if="search || borough || cuisine || grade"
          class="clear-button"
          @click="search = ''; borough = ''; cuisine = ''; grade = ''; applyFilters()"
        >
          Clear Filters
        </button>
      </div>

      <div class="query-bar">
        <span>▧ &nbsp; db.restaurants.find({})</span>
        <span>{{ pagination.total }} documents</span>
      </div>

      <div v-if="loading" class="message">
        Loading restaurant records...
      </div>

      <div v-else-if="error" class="message error-message">
        {{ error }}
        <button class="secondary-button" @click="loadRestaurants">
          Try again
        </button>
      </div>

      <div v-else-if="restaurants.length === 0" class="message">
        <h2>No restaurants found</h2>
        <p>Try changing your search or filters.</p>
      </div>

      <div v-else class="table-scroll">
        <table class="restaurant-table">
          <thead>
            <tr>
              <th>RESTAURANT</th>
              <th>BOROUGH</th>
              <th>CUISINE</th>
              <th>GRADE</th>
              <th>SCORE</th>
              <th>ACTIONS</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="restaurant in restaurants" :key="restaurant._id">
              <td class="restaurant-name-cell">
                <strong>{{ restaurant.name }}</strong>
                <span>
                  {{ restaurant.address?.building }}
                  {{ restaurant.address?.street }}
                  · #{{ restaurant.restaurant_id || restaurant._id }}
                </span>
              </td>

              <td>{{ restaurant.borough || '—' }}</td>
              <td>{{ restaurant.cuisine || '—' }}</td>

              <td>
                <span
                  class="grade-tag"
                  :class="'grade-' + restaurant.currentGrade"
                >
                  {{ restaurant.currentGrade || 'N/A' }}
                </span>
              </td>

              <td class="score-cell">
                {{ restaurant.currentScore ?? 'N/A' }}
              </td>

              <td>
                <div class="row-actions">
                  <RouterLink
                    :to="`/restaurants/${restaurant._id}`"
                    class="icon-action"
                    title="View restaurant"
                    aria-label="View restaurant"
                  >◉</RouterLink>

                  <RouterLink
                    :to="`/edit-restaurant/${restaurant._id}`"
                    class="icon-action"
                    title="Edit restaurant"
                    aria-label="Edit restaurant"
                  >
                    ✎
                  </RouterLink>

                  <button
                    type="button"
                    class="icon-action delete-action"
                    title="Delete restaurant"
                    aria-label="Delete restaurant"
                    @click.stop="openDeleteModal(restaurant)"
                  >
                    🗑
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <footer v-if="!loading && !error && restaurants.length" class="table-footer">
        <span>
          Showing {{ (page - 1) * 10 + 1 }}–{{ Math.min(page * 10, pagination.total) }}
          of {{ pagination.total }} restaurants
        </span>

        <div class="pagination">
          <button
            class="page-button"
            :disabled="page <= 1"
            @click="changePage(page - 1)"
          >
            ← Previous
          </button>

          <button
            v-for="pageNumber in pagination.pages"
            :key="pageNumber"
            class="page-button"
            :class="{ 'active-page': pageNumber === page }"
            @click="changePage(pageNumber)"
          >
            {{ pageNumber }}
          </button>

          <button
            class="page-button"
            :disabled="page >= pagination.pages"
            @click="changePage(page + 1)"
          >
            Next →
          </button>
        </div>
      </footer>
    </div>

    <section class="quality-section">
      <div class="quality-heading">
        <div>
          <h2>Best Quality Restaurants</h2>
          <p>Restaurants with the lowest average inspection scores.</p>
        </div>
        <span class="aggregate-badge">AGGREGATE · AVERAGE SCORE ↑</span>
      </div>

      <div v-if="!loading && restaurants.length" class="quality-grid">
        <article
          v-for="restaurant in restaurants.slice(0, 6)"
          :key="restaurant._id"
          class="quality-card"
        >
          <div class="quality-card-top">
            <span>{{ restaurant.cuisine || 'OTHER' }}</span>
            <span
              class="grade-tag"
              :class="'grade-' + restaurant.currentGrade"
            >
              {{ restaurant.currentGrade || 'N/A' }}
            </span>
          </div>

          <h3>{{ restaurant.name }}</h3>
          <p class="quality-location">⌖ {{ restaurant.borough || 'Location unavailable' }}</p>

          <div class="quality-card-bottom">
            <span>Score: {{ restaurant.currentScore ?? 'N/A' }}</span>
            <RouterLink :to="`/restaurants/${restaurant._id}`">
              View Details →
            </RouterLink>
          </div>
        </article>
      </div>
    </section>
  </section>
  
<Teleport to="body">
  <div
    v-if="showDeleteModal"
    class="modal-backdrop"
    @click.self="closeDeleteModal"
  >
    <section
      class="delete-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      <div class="delete-modal-icon">!</div>

      <h2 id="delete-modal-title">Delete Restaurant?</h2>

      <p>
        Are you sure you want to delete
        <strong>{{ selectedRestaurant?.name }}</strong>?
        This action cannot be undone.
      </p>

      <p v-if="deleteError" class="delete-error" role="alert">
        {{ deleteError }}
      </p>

      <div class="delete-modal-actions">
        <button
          type="button"
          class="modal-cancel"
          :disabled="deleting"
          @click="closeDeleteModal"
        >
          Cancel
        </button>

        <button
          type="button"
          class="modal-confirm"
          :disabled="deleting"
          @click="confirmDelete"
        >
          {{ deleting ? 'Deleting...' : 'Yes, Delete' }}
        </button>
      </div>
    </section>
  </div>
</Teleport>

</template>

<style scoped>

.restaurants-page {
  width: min( calc(100% - 64px), 1400px);
  margin: 48px auto 80px;
  color: #211f1c;
  font-size: 15px;
}

.page-heading,
.quality-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 22px;
}

.page-heading h1 {
  margin: 0;
  font-size: 29px;
  letter-spacing: -0.8px;
}

.page-heading p,
.quality-heading p {
  margin: 8px 0 0;
  color: #827b73;
  font-size: 13px;
}

.read-badge,
.aggregate-badge {
  display: inline-block;
  padding: 5px 7px;
  border-radius: 4px;
  background: #f1ede6;
  color: #857b70;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.4px;
  vertical-align: middle;
}

.primary-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 16px;
  border: 0;
  border-radius: 7px;
  background: #cb492f;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
}

.primary-button:hover {
  background: #ad3924;
}

.directory-panel,
.quality-card {
  overflow: hidden;
  border: 1px solid #eee9e2;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 3px 12px rgb(40 30 20 / 4%);
}

.filters {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 13px;
}

.filters label {
  min-width: 0;
  flex: 1;
}

.filters input,
.filters select {
  width: 100%;
  min-height: 37px;
  padding: 0 10px;
  border: 1px solid #eee8e0;
  border-radius: 6px;
  outline: none;
  background: #fff;
  color: #49443e;
  font: inherit;
  font-size: 11px;
}

.filters input:focus,
.filters select:focus {
  border-color: #cb715d;
  box-shadow: 0 0 0 2px rgb(203 73 47 / 8%);
}

.search-field {
  flex: 2 !important;
}

.clear-button {
  padding: 9px 4px;
  border: 0;
  background: transparent;
  color: #cb492f;
  font-size: 11px;
  cursor: pointer;
}

.query-bar {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 9px 13px;
  border-top: 1px solid #f2eee8;
  border-bottom: 1px solid #eee9e2;
  background: #fcfaf7;
  color: #8a8177;
  font-size: 10px;
}

.table-scroll {
  overflow-x: auto;
}

.restaurant-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  white-space: nowrap;
}

.restaurant-table th {
  padding: 13px 11px;
  border-bottom: 1px solid #eee9e2;
  color: #837b72;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.3px;
}

.restaurant-table td {
  padding: 12px 11px;
  border-bottom: 1px solid #f0ece6;
  font-size: 11px;
}

.restaurant-table tbody tr:last-child td {
  border-bottom: 0;
}

.restaurant-table tbody tr:hover {
  background: #fdfbf8;
}

.restaurant-name-cell {
  min-width: 210px;
  white-space: normal;
}

.restaurant-name-cell strong,
.restaurant-name-cell span {
  display: block;
}

.restaurant-name-cell strong {
  font-size: 11px;
}

.restaurant-name-cell span {
  margin-top: 5px;
  color: #8c8379;
  font-size: 9px;
}

.grade-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  padding: 5px 7px;
  border-radius: 5px;
  background: #e3f3e8;
  color: #237448;
  font-size: 10px;
  font-weight: 800;
}

.grade-B {
  background: #fff0d8;
  color: #a7670c;
}

.grade-C {
  background: #fde7e4;
  color: #b33e32;
}

.score-cell {
  font-weight: 700;
}

.row-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 26px;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: #898177;
  font-size: 15px;
  text-decoration: none;
  cursor: pointer;
}

.icon-action:hover {
  background: #f4eee7;
  color: #cb492f;
}

.delete-action:hover {
  background: #fde7e4;
  color: #b33e32;
}

.table-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 12px;
  border-top: 1px solid #eee9e2;
  color: #827b73;
  font-size: 10px;
}

.pagination {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

.page-button {
  min-width: 27px;
  min-height: 27px;
  padding: 5px 8px;
  border: 1px solid #eee8e0;
  border-radius: 5px;
  background: #fff;
  color: #655d54;
  font-size: 10px;
  cursor: pointer;
}

.page-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-button.active-page {
  border-color: #211f1c;
  background: #211f1c;
  color: #fff;
}

.quality-section {
  margin-top: 43px;
}

.quality-heading h2 {
  margin: 0;
  font-size: 21px;
  letter-spacing: -0.4px;
}

.quality-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.quality-card {
  padding: 16px;
}

.quality-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  color: #cb492f;
  font-size: 9px;
  font-weight: 800;
  text-transform: uppercase;
}

.quality-card h3 {
  margin: 12px 0 7px;
  font-size: 14px;
  line-height: 1.45;
}

.quality-location {
  margin: 0 0 17px;
  color: #827b73;
  font-size: 10px;
}

.quality-card-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #f0ece6;
  font-size: 10px;
}

.quality-card-bottom a {
  color: #cb492f;
  font-weight: 700;
  text-decoration: none;
}

.message {
  padding: 28px;
  color: #827b73;
  font-size: 13px;
  text-align: center;
}

.error-message {
  color: #b33e32;
}

.secondary-button {
  padding: 8px 12px;
  border: 1px solid #e8e1d8;
  border-radius: 6px;
  background: white;
  cursor: pointer;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}

@media (max-width: 760px) {
  .page-heading,
  .quality-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .filters {
    align-items: stretch;
    flex-wrap: wrap;
  }

  .filters label,
  .search-field {
    flex: 1 1 42% !important;
  }

  .quality-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .table-footer {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .restaurants-page {
    width: calc(100% - 24px);
    margin-top: 24px;
  }

  .page-heading h1 {
    font-size: 25px;
  }

  .quality-grid {
    grid-template-columns: 1fr;
  }
}

.restaurants-page {
  width: min(100% - 36px, 1000px);
  margin: 36px auto 72px;
  color: #211f1c;
}

.page-heading,
.quality-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 22px;
}

.page-heading h1 {
  margin: 0;
  font-size: 29px;
  letter-spacing: -0.8px;
}

.page-heading p,
.quality-heading p {
  margin: 8px 0 0;
  color: #827b73;
  font-size: 13px;
}

.read-badge,
.aggregate-badge {
  display: inline-block;
  padding: 5px 7px;
  border-radius: 4px;
  background: #f1ede6;
  color: #857b70;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.4px;
  vertical-align: middle;
}

.primary-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 16px;
  border: 0;
  border-radius: 7px;
  background: #cb492f;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
}

.primary-button:hover {
  background: #ad3924;
}

.directory-panel,
.quality-card {
  overflow: hidden;
  border: 1px solid #eee9e2;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 3px 12px rgb(40 30 20 / 4%);
}

.filters {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 13px;
}

.filters label {
  min-width: 0;
  flex: 1;
}

.filters input,
.filters select {
  width: 100%;
  min-height: 37px;
  padding: 0 10px;
  border: 1px solid #eee8e0;
  border-radius: 6px;
  outline: none;
  background: #fff;
  color: #49443e;
  font: inherit;
  font-size: 11px;
}

.filters input:focus,
.filters select:focus {
  border-color: #cb715d;
  box-shadow: 0 0 0 2px rgb(203 73 47 / 8%);
}

.search-field {
  flex: 2 !important;
}

.clear-button {
  padding: 9px 4px;
  border: 0;
  background: transparent;
  color: #cb492f;
  font-size: 11px;
  cursor: pointer;
}

.query-bar {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 9px 13px;
  border-top: 1px solid #f2eee8;
  border-bottom: 1px solid #eee9e2;
  background: #fcfaf7;
  color: #8a8177;
  font-size: 10px;
}

.table-scroll {
  overflow-x: auto;
}

.restaurant-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  white-space: nowrap;
}

.restaurant-table th {
  padding: 13px 11px;
  border-bottom: 1px solid #eee9e2;
  color: #837b72;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.3px;
}

.restaurant-table td {
  padding: 12px 11px;
  border-bottom: 1px solid #f0ece6;
  font-size: 11px;
}

.restaurant-table tbody tr:last-child td {
  border-bottom: 0;
}

.restaurant-table tbody tr:hover {
  background: #fdfbf8;
}

.restaurant-name-cell {
  min-width: 210px;
  white-space: normal;
}

.restaurant-name-cell strong,
.restaurant-name-cell span {
  display: block;
}

.restaurant-name-cell strong {
  font-size: 11px;
}

.restaurant-name-cell span {
  margin-top: 5px;
  color: #8c8379;
  font-size: 9px;
}

.grade-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  padding: 5px 7px;
  border-radius: 5px;
  background: #e3f3e8;
  color: #237448;
  font-size: 10px;
  font-weight: 800;
}

.grade-B {
  background: #fff0d8;
  color: #a7670c;
}

.grade-C {
  background: #fde7e4;
  color: #b33e32;
}

.score-cell {
  font-weight: 700;
}

.row-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 26px;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: #898177;
  font-size: 15px;
  text-decoration: none;
  cursor: pointer;
}

.icon-action:hover {
  background: #f4eee7;
  color: #cb492f;
}

.delete-action:hover {
  background: #fde7e4;
  color: #b33e32;
}

.table-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 12px;
  border-top: 1px solid #eee9e2;
  color: #827b73;
  font-size: 10px;
}

.pagination {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

.page-button {
  min-width: 27px;
  min-height: 27px;
  padding: 5px 8px;
  border: 1px solid #eee8e0;
  border-radius: 5px;
  background: #fff;
  color: #655d54;
  font-size: 10px;
  cursor: pointer;
}

.page-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-button.active-page {
  border-color: #211f1c;
  background: #211f1c;
  color: #fff;
}

.quality-section {
  margin-top: 43px;
}

.quality-heading h2 {
  margin: 0;
  font-size: 21px;
  letter-spacing: -0.4px;
}

.quality-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.quality-card {
  padding: 16px;
}

.quality-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  color: #cb492f;
  font-size: 9px;
  font-weight: 800;
  text-transform: uppercase;
}

.quality-card h3 {
  margin: 12px 0 7px;
  font-size: 14px;
  line-height: 1.45;
}

.quality-location {
  margin: 0 0 17px;
  color: #827b73;
  font-size: 10px;
}

.quality-card-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #f0ece6;
  font-size: 10px;
}

.quality-card-bottom a {
  color: #cb492f;
  font-weight: 700;
  text-decoration: none;
}

.message {
  padding: 28px;
  color: #827b73;
  font-size: 13px;
  text-align: center;
}

.error-message {
  color: #b33e32;
}

.secondary-button {
  padding: 8px 12px;
  border: 1px solid #e8e1d8;
  border-radius: 6px;
  background: white;
  cursor: pointer;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}

/* Larger, more readable desktop layout */
.page-heading h1 {
  font-size: 36px;
}

.page-heading p,
.quality-heading p {
  font-size: 15px;
}

.primary-button {
  padding: 14px 20px;
  font-size: 14px;
}

.filters {
  gap: 12px;
  padding: 18px;
}

.filters input,
.filters select {
  min-height: 44px;
  padding: 0 13px;
  font-size: 14px;
}

.query-bar {
  padding: 12px 18px;
  font-size: 12px;
}

.restaurant-table th {
  padding: 17px 16px;
  font-size: 12px;
}

.restaurant-table td {
  padding: 17px 16px;
  font-size: 14px;
}

.restaurant-name-cell {
  min-width: 260px;
}

.restaurant-name-cell strong {
  font-size: 14px;
}

.restaurant-name-cell span {
  font-size: 12px;
}

.grade-tag {
  min-width: 28px;
  padding: 6px 9px;
  font-size: 12px;
}

.icon-action {
  width: 34px;
  height: 34px;
  font-size: 19px;
}

.table-footer {
  padding: 17px 18px;
  font-size: 12px;
}

.page-button {
  min-width: 34px;
  min-height: 34px;
  font-size: 12px;
}

.quality-section {
  margin-top: 56px;
}

.quality-heading h2 {
  font-size: 26px;
}

.quality-grid {
  gap: 16px;
}

.quality-card {
  padding: 22px;
}

.quality-card-top {
  font-size: 11px;
}

.quality-card h3 {
  font-size: 17px;
}

.quality-location,
.quality-card-bottom {
  font-size: 12px;
}


:global(.modal-backdrop) {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgb(24 22 20 / 55%);
  backdrop-filter: blur(3px);
}

:global(.delete-modal) {
  width: min(100%, 440px);
  padding: 30px;
  border: 1px solid #eee9e2;
  border-radius: 16px;
  background: #fff;
  color: #211f1c;
  box-shadow: 0 24px 80px rgb(0 0 0 / 20%);
  animation: modal-enter 160ms ease-out;
}

:global(.delete-modal-icon) {
  display: grid;
  width: 46px;
  height: 46px;
  place-items: center;
  border-radius: 50%;
  background: #fde7e4;
  color: #b33e32;
  font-size: 24px;
  font-weight: 800;
}

:global(.delete-modal h2) {
  margin: 18px 0 10px;
  font-size: 23px;
}

:global(.delete-modal > p) {
  color: #756d64;
  font-size: 14px;
  line-height: 1.7;
}

:global(.delete-modal strong) {
  color: #211f1c;
}

:global(.delete-error) {
  padding: 10px;
  border-radius: 7px;
  background: #fde7e4;
  color: #b33e32 !important;
}

:global(.delete-modal-actions) {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 25px;
}

:global(.modal-cancel),
:global(.modal-confirm) {
  min-height: 42px;
  padding: 10px 16px;
  border: 0;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
}

:global(.modal-cancel) {
  background: #f1ede6;
  color: #49443e;
}

:global(.modal-confirm) {
  background: #c83f32;
  color: white;
}

:global(.modal-confirm:hover) {
  background: #a92e25;
}

:global(.modal-cancel:disabled),
:global(.modal-confirm:disabled) {
  opacity: 0.6;
  cursor: wait;
}

@keyframes modal-enter {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.98);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}


@media (max-width: 760px) {
  .page-heading,
  .quality-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .filters {
    align-items: stretch;
    flex-wrap: wrap;
  }

  .filters label,
  .search-field {
    flex: 1 1 42% !important;
  }

  .quality-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .table-footer {
    align-items: flex-start;
    flex-direction: column;
  }
  .restaurants-page {
    width: calc(100% - 32px);
    margin-top: 28px;
  }

  .page-heading h1 {
    font-size: 30px;
  }

  .restaurant-table th,
  .restaurant-table td {
    padding: 14px 12px;
  }
}

@media (max-width: 480px) {
  .restaurants-page {
    width: calc(100% - 24px);
    margin-top: 24px;
  }

  .page-heading h1 {
    font-size: 25px;
  }

  .quality-grid {
    grid-template-columns: 1fr;
  }
}

</style>