<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { restaurantService } from '../services/restaurantService'

const route = useRoute()
const router = useRouter()

const restaurant = ref(null)
const loading = ref(true)
const error = ref('')
const showDeleteModal = ref(false)
const deleting = ref(false)
const deleteError = ref('')

async function loadRestaurant() {
  loading.value = true
  error.value = ''
  restaurant.value = null

  try {
    const response = await restaurantService.getRestaurant(route.params.id)
    restaurant.value = response?.data ?? response

    if (!restaurant.value) {
      throw new Error('Restaurant information was not found.')
    }
  } catch (err) {
    error.value =
      err?.response?.data?.message ||
      err?.message ||
      'Unable to load restaurant details.'
  } finally {
    loading.value = false
  }
}

function formatDate(date) {
  if (!date) return 'Not available'

  const parsedDate = new Date(date)

  if (Number.isNaN(parsedDate.getTime())) return 'Not available'

  return parsedDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const currentGrade = () =>
  restaurant.value?.currentGrade ??
  restaurant.value?.grades?.[0]?.grade ??
  null

const currentScore = () =>
  restaurant.value?.currentScore ??
  restaurant.value?.grades?.[0]?.score ??
  null

const inspectionHistory = () => {
  const grades = restaurant.value?.grades
  if (!Array.isArray(grades)) return []

  return [...grades].sort((a, b) => {
    const dateA = new Date(a.date || 0).getTime()
    const dateB = new Date(b.date || 0).getTime()
    return dateB - dateA
  })
}

function openDeleteModal() {
  deleteError.value = ''
  showDeleteModal.value = true
}

function closeDeleteModal() {
  if (deleting.value) return
  showDeleteModal.value = false
  deleteError.value = ''
}

function handleKeydown(event) {
  if (event.key === 'Escape' && showDeleteModal.value) {
    closeDeleteModal()
  }
}

async function deleteRestaurant() {
  if (deleting.value || !restaurant.value) return

  deleting.value = true
  deleteError.value = ''

  try {
    await restaurantService.deleteRestaurant(route.params.id)
    showDeleteModal.value = false
    await router.push('/restaurants')
  } catch (err) {
    deleteError.value =
      err?.response?.data?.message ||
      err?.message ||
      'Unable to delete this restaurant.'
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  loadRestaurant()
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <main class="details-page">
    <RouterLink class="back-link" to="/restaurants">
      ← Back to Restaurants
    </RouterLink>

    <div v-if="loading" class="state-panel">
      Loading restaurant details...
    </div>

    <div v-else-if="error" class="state-panel error-state" role="alert">
      <h2>Unable to load restaurant</h2>
      <p>{{ error }}</p>
      <button class="button button-primary" @click="loadRestaurant">
        Try Again
      </button>
    </div>

    <template v-else-if="restaurant">
      <header class="details-heading">
        <div class="heading-copy">
          <span class="eyebrow">RESTAURANT DETAILS</span>
          <h1>{{ restaurant.name }}</h1>
          <p>{{ restaurant.cuisine }} · {{ restaurant.borough }}</p>
        </div>

        <div class="heading-actions">
          <RouterLink
            class="button button-secondary"
            :to="`/edit-restaurant/${restaurant._id}`"
          >
            Edit Restaurant
          </RouterLink>

          <button
            class="button button-danger"
            type="button"
            @click="openDeleteModal"
          >
            Delete Restaurant
          </button>
        </div>
      </header>

      <section class="overview-grid">
        <article class="panel information-panel">
          <h2>Restaurant Information</h2>

          <dl class="information-grid">
            <div class="info-item">
              <dt>Borough</dt>
              <dd>{{ restaurant.borough || 'Not available' }}</dd>
            </div>

            <div class="info-item">
              <dt>Cuisine</dt>
              <dd>{{ restaurant.cuisine || 'Not available' }}</dd>
            </div>

            <div class="info-item info-wide">
              <dt>Address</dt>
              <dd>
                {{ restaurant.address?.building || '' }}
                {{ restaurant.address?.street || '' }}
                {{ restaurant.address?.zipcode || '' }}
              </dd>
            </div>

            <div class="info-item">
              <dt>Building</dt>
              <dd>{{ restaurant.address?.building || 'Not available' }}</dd>
            </div>

            <div class="info-item">
              <dt>Street</dt>
              <dd>{{ restaurant.address?.street || 'Not available' }}</dd>
            </div>

            <div class="info-item">
              <dt>ZIP Code</dt>
              <dd>{{ restaurant.address?.zipcode || 'Not available' }}</dd>
            </div>

            <div class="info-item">
              <dt>Restaurant ID</dt>
              <dd>{{ restaurant.restaurant_id || restaurant._id }}</dd>
            </div>
          </dl>
        </article>

        <article class="panel grade-panel">
          <h2>Current Grade</h2>

          <div
            class="grade-display"
            :class="`grade-${currentGrade() || 'none'}`"
          >
            {{ currentGrade() || '—' }}
          </div>

          <div class="score-summary">
            <span>Score</span>
            <strong>{{ currentScore() ?? 'N/A' }}</strong>
          </div>

          <p class="grade-description">
            {{
              currentGrade() === 'A'
                ? 'Excellent'
                : currentGrade() === 'B'
                  ? 'Good'
                  : currentGrade() === 'C'
                    ? 'Needs Improvement'
                    : 'No grade available'
            }}
          </p>

          <p class="inspection-caption">
            Inspected {{ formatDate(restaurant.latestInspection) }}.
            Lower scores indicate fewer violations.
          </p>
        </article>
      </section>

      <section class="panel history-panel">
        <div class="history-heading">
          <h2>Inspection / Grade Information</h2>
          <span class="inspection-count">
            {{ inspectionHistory().length }}
            {{ inspectionHistory().length === 1 ? 'inspection' : 'inspections' }}
          </span>
        </div>

        <div v-if="inspectionHistory().length" class="table-scroll">
          <table class="inspection-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Grade</th>
                <th>Score</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="(inspection, index) in inspectionHistory()"
                :key="`${inspection.date}-${index}`"
              >
                <td>
                  {{ formatDate(inspection.date) }}
                  <span v-if="index === 0" class="latest-label">
                    Latest
                  </span>
                </td>

                <td>
                  <span
                    class="grade-badge"
                    :class="`grade-${inspection.grade || 'none'}`"
                  >
                    {{ inspection.grade || 'N/A' }}
                  </span>
                </td>

                <td>{{ inspection.score ?? 'N/A' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p v-else class="empty-history">
          No inspection history is available.
        </p>
      </section>

      <p v-if="deleteError" class="delete-error" role="alert">
        {{ deleteError }}
      </p>

      <div
        v-if="showDeleteModal"
        class="modal-overlay"
        @click.self="closeDeleteModal"
      >
        <section
          class="delete-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
        >
          <div class="modal-icon" aria-hidden="true">!</div>

          <p class="modal-eyebrow">RESTOHUB · CONFIRMATION</p>
          <h2 id="delete-modal-title">Delete Restaurant?</h2>

          <p class="modal-description">
            Are you sure you want to delete
            <strong>{{ restaurant.name }}</strong>?
            This action cannot be undone.
          </p>

          <div class="modal-actions">
            <button
              class="button button-secondary"
              type="button"
              :disabled="deleting"
              @click="closeDeleteModal"
            >
              Cancel
            </button>

            <button
              class="button button-danger"
              type="button"
              :disabled="deleting"
              @click="deleteRestaurant"
            >
              {{ deleting ? 'Deleting...' : 'Yes, Delete' }}
            </button>
          </div>
        </section>
      </div>
    </template>
  </main>
</template>

<style scoped>
.details-page {
  width: min(1240px, calc(100% - 48px));
  margin: 42px auto 56px;
  color: #1f1c1a;
  font-size: 1.04rem;
}

.details-heading h1 {
  margin: 8px 0;
  font-size: clamp(2rem, 3vw, 2.6rem);
  font-weight: 800;
  letter-spacing: -0.045em;
  line-height: 1.2;
}

.details-heading p {
  margin: 8px 0 0;
  color: #786e65;
  font-size: 0.95rem;
}

.details-eyebrow {
  color: #d7462f;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.back-link {
  display: inline-block;
  margin-bottom: 30px;
  color: #665c54;
  font-size: 0.84rem;
  text-decoration: none;
}

.back-link:hover {
  color: #d4442f;
}

.details-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 26px;
}

.eyebrow {
  color: #d4442f;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.heading-copy h1 {
  margin: 6px 0;
  color: #211e1b;
  font-size: clamp(2rem, 3.5vw, 2.65rem);
  line-height: 1.15;
  letter-spacing: -0.04em;
  overflow-wrap: anywhere;
}

.heading-copy p {
  margin: 8px 0 0;
  color: #756b63;
  font-size: 0.92rem;
}

.heading-actions {
  display: flex;
  flex-shrink: 0;
  flex-wrap: wrap;
  gap: 10px;
}

.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  padding: 10px 16px;
  border: 1px solid transparent;
  border-radius: 7px;
  font: inherit;
  font-size: 0.82rem;
  font-weight: 750;
  text-decoration: none;
  cursor: pointer;
  transition: background 150ms ease, border-color 150ms ease;
}

.button:disabled {
  opacity: 0.6;
  cursor: wait;
}

.button-secondary {
  border-color: #eee4dc;
  background: #fff;
  color: #29231f;
}

.button-secondary:hover:not(:disabled) {
  background: #f7f1eb;
}

.button-primary {
  background: #d4442f;
  color: #fff;
}

.button-primary:hover:not(:disabled) {
  background: #b93625;
}

.button-danger {
  background: #d33c2d;
  color: #fff;
}

.button-danger:hover:not(:disabled) {
  background: #b52d22;
}

.overview-grid {
  display: grid;
  grid-template-columns: minmax(0, 2.15fr) minmax(240px, 1fr);
  gap: 16px;
  align-items: stretch;
}

.panel,
.state-panel {
  min-width: 0;
  border: 1px solid #eee6de;
  border-radius: 11px;
  background: #fff;
  box-shadow: 0 4px 16px rgb(50 35 22 / 4%);
}

.panel {
  padding: 28px;
}

.panel h2 {
  margin: 0 0 24px;
  color: #211e1b;
  font-size: 1.08rem;
  font-weight: 800;
}

.information-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22px 24px;
  margin: 0;
}

.info-item {
  min-width: 0;
}

.info-wide {
  grid-column: 1 / -1;
}

.info-item dt {
  margin-bottom: 7px;
  color: #81766d;
  font-size: 0.82rem;
}

.info-item dd {
  margin: 0;
  color: #211e1b;
  font-size: 0.96rem;
  font-weight: 700;
  overflow-wrap: anywhere;
}

.grade-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.grade-panel h2 {
  align-self: flex-start;
  width: 100%;
  text-align: left;
}

.grade-display {
  display: grid;
  width: 92px;
  height: 92px;
  place-items: center;
  border-radius: 14px;
  font-size: 2.7rem;
  font-weight: 850;
}

.grade-A {
  background: #e2f3e8;
  color: #247747;
}

.grade-B {
  background: #fff0d8;
  color: #996019;
}

.grade-C {
  background: #fbe5e1;
  color: #b93625;
}

.grade-none {
  background: #f1ece7;
  color: #6f6258;
}

.score-summary {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 18px;
}

.score-summary span {
  color: #81766d;
  font-size: 0.78rem;
}

.score-summary strong {
  color: #211e1b;
  font-size: 1.65rem;
}

.grade-description {
  margin: 15px 0 0;
  color: #302923;
  font-size: 0.83rem;
  font-weight: 800;
}

.inspection-caption {
  margin: 18px 0 0;
  color: #81766d;
  font-size: 0.75rem;
  line-height: 1.6;
}

.history-panel {
  margin-top: 16px;
}

.history-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.history-heading h2 {
  margin-bottom: 12px;
}

.inspection-count {
  flex-shrink: 0;
  padding: 5px 8px;
  border-radius: 5px;
  background: #f2ebe4;
  color: #75675c;
  font-size: 0.7rem;
  font-weight: 700;
}

.table-scroll {
  overflow-x: auto;
}

.inspection-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.inspection-table th {
  padding: 12px 16px;
  border-bottom: 1px solid #eee6de;
  color: #81766d;
  font-size: 0.76rem;
  font-weight: 750;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.inspection-table td {
  padding: 16px;
  border-bottom: 1px solid #eee6de;
  color: #29231f;
  font-size: 0.9rem;
}

.inspection-table tbody tr:last-child td {
  border-bottom: 0;
}

.latest-label {
  display: inline-block;
  margin-left: 5px;
  color: #d4442f;
  font-size: 0.68rem;
  font-weight: 800;
}

.grade-badge {
  display: inline-flex;
  min-width: 27px;
  min-height: 26px;
  align-items: center;
  justify-content: center;
  padding: 4px 7px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 850;
}

.empty-history {
  color: #81766d;
  font-size: 0.86rem;
}

.state-panel {
  padding: 36px 24px;
  color: #756b63;
  text-align: center;
}

.state-panel h2 {
  color: #211e1b;
}

.error-state {
  color: #b93625;
}

.delete-error {
  margin-top: 16px;
  color: #b93625;
  font-size: 0.85rem;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgb(25 20 17 / 62%);
  backdrop-filter: blur(3px);
}

.delete-modal {
  width: 100%;
  max-width: 430px;
  padding: 30px;
  border: 1px solid #eee6de;
  border-radius: 14px;
  background: #fff;
  color: #211e1b;
  text-align: center;
  box-shadow: 0 24px 80px rgb(0 0 0 / 22%);
  animation: modal-appear 180ms ease-out;
}

.modal-icon {
  display: grid;
  width: 54px;
  height: 54px;
  margin: 0 auto 18px;
  place-items: center;
  border-radius: 50%;
  background: #fbe8e2;
  color: #c63c29;
  font-size: 26px;
  font-weight: 850;
}

.modal-eyebrow {
  margin: 0 0 8px;
  color: #d4442f;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.1em;
}

.delete-modal h2 {
  margin: 0 0 12px;
  font-size: 1.5rem;
}

.modal-description {
  margin: 0;
  color: #756b63;
  font-size: 0.9rem;
  line-height: 1.7;
  overflow-wrap: anywhere;
}

.modal-description strong {
  color: #211e1b;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 26px;
}

@keyframes modal-appear {
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
  .details-page {
    width: calc(100% - 32px);
    margin-top: 28px;
  }

  .details-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .heading-actions {
    width: 100%;
  }

  .overview-grid {
    grid-template-columns: 1fr;
  }

  .grade-panel {
    align-items: flex-start;
    text-align: left;
  }

  .grade-panel h2 {
    text-align: left;
  }

  .inspection-caption {
    max-width: 340px;
  }
}

@media (max-width: 480px) {
  .panel {
    padding: 18px;
  }

  .information-grid {
    gap: 18px 12px;
  }

  .heading-actions .button {
    flex: 1;
  }

  .history-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .inspection-table th,
  .inspection-table td {
    padding: 12px 10px;
    white-space: nowrap;
  }

  .delete-modal {
    padding: 24px 18px;
  }

  .modal-actions {
    flex-direction: column-reverse;
  }
}

@media (prefers-reduced-motion: reduce) {
  .delete-modal {
    animation: none;
  }
}
</style>
