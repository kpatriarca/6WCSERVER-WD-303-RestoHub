<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { restaurantService } from '../services/restaurantService'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const saving = ref(false)
const error = ref('')
const loaded = ref(false)

const form = reactive({
  name: '',
  borough: '',
  cuisine: '',
  address: {
    building: '',
    street: '',
    zipcode: '',
  },
  grade: 'A',
  score: 0,
})

const boroughs = [
  'Bronx',
  'Brooklyn',
  'Manhattan',
  'Queens',
  'Staten Island',
]


async function loadRestaurant() {
  loading.value = true
  loaded.value = false
  error.value = ''

  try {
    const response = await restaurantService.getRestaurant(route.params.id)

    // Support either { data: restaurant } or a direct restaurant response.
    const restaurant = response?.data ?? response

    if (!restaurant || typeof restaurant !== 'object') {
      throw new Error('The server returned no restaurant data.')
    }

    form.name = restaurant.name || ''
    form.borough = restaurant.borough || ''
    form.cuisine = restaurant.cuisine || ''
    form.address.building = restaurant.address?.building || ''
    form.address.street = restaurant.address?.street || ''
    form.address.zipcode = restaurant.address?.zipcode || ''

    form.grade =
      restaurant.currentGrade ??
      restaurant.grade ??
      restaurant.grades?.[0]?.grade ??
      'A'

    form.score =
      restaurant.currentScore ??
      restaurant.score ??
      restaurant.grades?.[0]?.score ??
      0

    loaded.value = true
  } catch (err) {
    console.error('Failed to load restaurant:', err)
    error.value =
      err?.response?.data?.message ||
      err?.message ||
      'Unable to load restaurant information.'
  } finally {
    loading.value = false
  }
}

async function submitForm() {
  saving.value = true
  error.value = ''

  try {
    const response = await restaurantService.updateRestaurant(route.params.id, {
      ...form,
      address: { ...form.address },
      score: Number(form.score),
    })

    await router.push(`/restaurants/${response.data._id}`)
  } catch (err) {
    error.value = err.message
  } finally {
    saving.value = false
  }
}

onMounted(loadRestaurant)
</script>

<template>
  <section class="edit-page">
    <RouterLink class="back-link" :to="`/restaurants/${route.params.id}`">
      ← Back to restaurant details
    </RouterLink>

    <header class="page-heading">
      <div class="heading-eyebrow">
        <p class="eyebrow">MANAGE RESTAURANT RECORD</p>
      </div>

      <div class="heading-title">
        <h1>Edit Restaurant</h1>
        <p>Update the restaurant information below. Grade changes add a new inspection.</p>
      </div>
    </header>

    <div v-if="loading" class="status-message">
      Loading restaurant information...
    </div>

    <div v-else-if="!loaded" class="status-message error-message" role="alert">
      <h2>Unable to load restaurant</h2>
      <p>{{ error }}</p>
      <button class="submit-button" @click="loadRestaurant">Try again</button>
    </div>

    <form v-else class="edit-form" @submit.prevent="submitForm">
      <div v-if="error" class="form-alert" role="alert">
        {{ error }}
      </div>

      <h2>Restaurant Information</h2>

      <label class="full-width">
        Restaurant Name
        <input v-model.trim="form.name" required maxlength="150" />
      </label>

      <div class="form-grid">
        <label>
          Borough
          <select v-model="form.borough" required>
            <option value="" disabled>Select borough</option>
            <option v-for="item in boroughs" :key="item" :value="item">
              {{ item }}
            </option>
          </select>
        </label>

        <label>
          Cuisine
          <input v-model.trim="form.cuisine" required maxlength="100" />
        </label>

        <label>
          Building Number
          <input v-model.trim="form.address.building" required />
        </label>

        <label>
          Street
          <input v-model.trim="form.address.street" required />
        </label>

        <label class="full-width">
          ZIP Code
          <input
            v-model.trim="form.address.zipcode"
            pattern="\d{5}(-\d{4})?"
            title="Enter a 5-digit ZIP code or ZIP+4"
            required
          />
        </label>
      </div>

      <div class="form-divider"></div>

      <h2>Latest Inspection</h2>

      <div class="form-grid">
        <label>
          Inspection Grade
          <select v-model="form.grade" required>
            <option value="A">Grade A</option>
            <option value="B">Grade B</option>
            <option value="C">Grade C</option>
          </select>
        </label>

        <label>
          Inspection Score
          <input v-model.number="form.score" type="number" min="0" required />
        </label>
      </div>

      <p class="form-note">
        Saving will update the restaurant and record a new inspection entry if
        the grade or score changes.
      </p>

      <div class="form-actions">
        <RouterLink
          class="cancel-button"
          :to="`/restaurants/${route.params.id}`"
        >
          Cancel
        </RouterLink>

        <button class="submit-button" type="submit" :disabled="saving">
          {{ saving ? 'Saving changes...' : 'Save Changes' }}
        </button>
      </div>
    </form>
  </section>
</template>

<style scoped>
.edit-page {
  width: min(1038px, calc(100% - 48px));
  margin: 44px auto 40px;
  color: #201d1a;
}

/* Back link */
.back-link {
  display: inline-block;
  margin-bottom: 24px;
  color: #8b4a32;
  font-size: 0.9rem;
  font-weight: 700;
  text-decoration: none;
}

.back-link:hover {
  color: #c9472c;
  text-decoration: underline;
}

/* Page heading */
.page-heading {
  display: block;
  margin-bottom: 26px;
}

.page-heading .eyebrow {
  margin: 0 0 8px;
  color: #927d6e;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.14em;
}

.page-heading h1 {
  margin: 0 0 8px;
  color: #201d1a;
  font-size: clamp(2rem, 3vw, 2.5rem);
  font-weight: 800;
  letter-spacing: -0.045em;
  line-height: 1.2;
}

.page-heading > p:last-child {
  margin: 0;
  color: #716b66;
  font-size: 1rem;
  line-height: 1.65;
}

/* Main form card */
.edit-form,
.status-message {
  padding: 32px;
  border: 1px solid #e9e0d7;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 4px 18px rgb(53 38 27 / 5%);
}

.edit-form h2 {
  margin: 0 0 22px;
  color: #201d1a;
  font-size: 1.1rem;
  font-weight: 800;
}

/* Form fields */
.edit-form > label.full-width {
  margin-bottom: 22px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22px 20px;
  margin-top: 0;
}

.edit-form label {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 8px;
  color: #39312b;
  font-size: 0.86rem;
  font-weight: 700;
}

.edit-form .full-width {
  grid-column: 1 / -1;
}

.edit-form input,
.edit-form select {
  width: 100%;
  min-height: 46px;
  padding: 11px 13px;
  border: 1px solid #e0d6cc;
  border-radius: 8px;
  background: #fff;
  color: #29231f;
  font-family: inherit;
  font-size: 0.95rem;
  font-weight: 400;
  transition: border-color 160ms ease, box-shadow 160ms ease;
}

.edit-form input:hover,
.edit-form select:hover {
  border-color: #cbb9aa;
}

.edit-form input:focus,
.edit-form select:focus {
  border-color: #d34b30;
  outline: none;
  box-shadow: 0 0 0 3px rgb(211 75 48 / 12%);
}

/* Section separator */
.form-divider {
  height: 1px;
  margin: 28px 0;
  background: #eee6de;
}

/* Inspection helper text */
.form-note {
  margin: 18px 0 0;
  color: #716b66;
  font-size: 0.85rem;
  line-height: 1.7;
}

/* Form buttons */
.form-actions {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 26px;
}

.cancel-button,
.submit-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 11px 18px;
  border: 1px solid transparent;
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: 750;
  text-decoration: none;
  cursor: pointer;
  transition: background 160ms ease, border-color 160ms ease,
    transform 160ms ease;
}

.cancel-button {
  border-color: #e9e0d7;
  background: #fff;
  color: #29231f;
}

.cancel-button:hover {
  border-color: #d8c9bc;
  background: #f8f3ee;
}

.submit-button {
  border-color: #cf482d;
  background: #cf482d;
  color: #fff;
}

.submit-button:hover:not(:disabled) {
  border-color: #b83b24;
  background: #b83b24;
  transform: translateY(-1px);
}

.submit-button:disabled {
  opacity: 0.65;
  cursor: wait;
  transform: none;
}

/* Error and loading states */
.form-alert {
  margin-bottom: 22px;
  padding: 14px 16px;
  border: 1px solid #f0c9c0;
  border-radius: 8px;
  background: #fff0ed;
  color: #a43a30;
  font-size: 0.9rem;
  line-height: 1.5;
}

.status-message {
  color: #716b66;
  font-size: 0.95rem;
  line-height: 1.7;
}

.status-message h2 {
  color: #201d1a;
}

.error-message {
  color: #a43a30;
}

/* Responsive layout */
@media (max-width: 700px) {
  .edit-page {
    width: calc(100% - 32px);
    margin-top: 28px;
  }

  .edit-form,
  .status-message {
    padding: 24px 20px;
  }

  .form-grid {
    gap: 18px 14px;
  }
}

@media (max-width: 520px) {
  .edit-page {
    width: calc(100% - 24px);
    margin-top: 22px;
  }

  .page-heading h1 {
    font-size: 1.9rem;
  }

  .page-heading > p:last-child {
    font-size: 0.92rem;
  }

  .edit-form,
  .status-message {
    padding: 20px 16px;
  }

  .form-grid {
    grid-template-columns: 1fr;
    gap: 17px;
  }

  .edit-form .full-width {
    grid-column: auto;
  }

  .form-actions {
    gap: 8px;
  }

  .cancel-button,
  .submit-button {
    min-height: 42px;
    padding: 10px 14px;
  }
}
</style>

