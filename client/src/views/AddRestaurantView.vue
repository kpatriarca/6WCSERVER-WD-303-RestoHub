<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { restaurantService } from '../services/restaurantService'

const router = useRouter()
const saving = ref(false)
const error = ref('')
const success = ref('')

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

async function submitForm() {
  saving.value = true
  error.value = ''
  success.value = ''

  try {
    const result = await restaurantService.createRestaurant({
      ...form,
      address: { ...form.address },
      score: Number(form.score),
    })

    success.value = result.message || 'Restaurant added successfully.'

    const id = result.data?._id

    if (id) {
      await router.push(`/restaurants/${id}`)
    } else {
      await router.push('/restaurants')
    }
  } catch (err) {
    error.value = err.message
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <section class="form-page">
    <RouterLink class="back-link" to="/restaurants">
      ← Back to restaurants
    </RouterLink>

    <header class="form-heading">
      <p class="eyebrow">EXPAND THE DIRECTORY</p>
      <h1>Add a Restaurant</h1>
      <p>Enter the restaurant's details and latest inspection information.</p>
    </header>

    <form class="restaurant-form" @submit.prevent="submitForm">
      <div v-if="error" class="form-alert error-alert" role="alert">
        {{ error }}
      </div>

      <div v-if="success" class="form-alert success-alert" role="status">
        {{ success }}
      </div>

      <h2>Restaurant Information</h2>

      <label class="full-width">
        Restaurant Name
        <input
          v-model.trim="form.name"
          type="text"
          placeholder="e.g. Green Garden Restaurant"
          required
          maxlength="150"
        />
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
          <input
            v-model.trim="form.cuisine"
            type="text"
            placeholder="e.g. Italian"
            required
            maxlength="100"
          />
        </label>

        <label>
          Building Number
          <input
            v-model.trim="form.address.building"
            type="text"
            placeholder="e.g. 125"
            required
          />
        </label>

        <label>
          Street
          <input
            v-model.trim="form.address.street"
            type="text"
            placeholder="e.g. Main Street"
            required
          />
        </label>

        <label class="full-width">
          ZIP Code
          <input
            v-model.trim="form.address.zipcode"
            type="text"
            placeholder="5-digit ZIP code"
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
          <input
            v-model.number="form.score"
            type="number"
            min="0"
            step="1"
            required
          />
        </label>
      </div>

      <p class="form-note">
        The inspection date will be recorded automatically when the restaurant
        is saved.
      </p>

      <div class="form-actions">
        <RouterLink class="cancel-button" to="/restaurants">
          Cancel
        </RouterLink>

        <button class="submit-button" type="submit" :disabled="saving">
          {{ saving ? 'Saving...' : 'Save Restaurant' }}
        </button>
      </div>
    </form>
  </section>
</template>

<style scoped>
.form-page {
  width: min(1000px, calc(100% - 48px));
  margin: 8px auto 60px;
  color: #211e1b;
}

/* Back link */
.back-link {
  display: inline-block;
  margin-bottom: 34px;
  color: #665c54;
  font-size: 0.95rem;
  font-weight: 700;
  text-decoration: none;
  transition: color 150ms ease;
}

.back-link:hover {
  color: #d4442f;
}

/* Page heading */
.form-heading {
  margin-bottom: 32px;
}

.eyebrow {
  margin: 0 0 8px;
  color: #d4442f;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.13em;
  margin-bottom: 10px;
}

.form-heading h1 {
  margin: 0 0 8px;
  color: #211e1b;
  font-size: clamp(2.5rem, 4vw, 3.1rem);
  font-weight: 800;
  letter-spacing: -0.045em;
  line-height: 1.2;
  margin-bottom: 12px;
}

.form-heading > p:last-child {
  margin: 0;
  color: #756b63;
  font-size: 1rem;
  line-height: 1.7;
}

/* Form card */
.restaurant-form {
  padding: 38px 34px 30px;
  border: 1px solid #eee6de;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 4px 18px rgb(50 35 22 / 5%);
}

.restaurant-form h2 {
  margin: 0 0 20px;
  color: #211e1b;
  font-size: 1.15rem;
  font-weight: 800;
  margin-bottom: 24px;
}

/* Fields */
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px 20px;
  margin-top: 22px;
}

.restaurant-form label {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 7px;
  color: #302a25;
  font-size: 0.88rem;
  font-weight: 700;
}

.restaurant-form .full-width {
  grid-column: 1 / -1;
  margin-bottom: 22px;
}

.restaurant-form input,
.restaurant-form select {
  width: 100%;
  min-height: 40px;
  padding: 9px 11px;
  border: 1px solid #e1d7cc;
  border-radius: 6px;
  background: #fff;
  color: #211e1b;
  font-family: inherit;
  font-size: 0.82rem;
  font-weight: 400;
  transition: border-color 150ms ease, box-shadow 150ms ease;
}

.restaurant-form input::placeholder {
  color: #a1968c;
}

.restaurant-form input:focus,
.restaurant-form select:focus {
  border-color: #d4442f;
  outline: none;
  box-shadow: 0 0 0 3px rgb(212 68 47 / 12%);
}

/* Section divider */
.form-divider {
  height: 1px;
  margin: 24px 0;
  background: #eee6de;
}

/* Inspection note */
.form-note {
  margin: 16px 0 0;
  color: #81766d;
  font-size: 0.75rem;
  line-height: 1.65;
}

/* Alerts */
.form-alert {
  margin-bottom: 20px;
  padding: 12px 14px;
  border: 1px solid transparent;
  border-radius: 7px;
  font-size: 0.83rem;
  line-height: 1.5;
}

.error-alert {
  border-color: #f0c9c2;
  background: #fff0ed;
  color: #a43a30;
}

.success-alert {
  border-color: #f0c9c2;
  background: #fff5f1;
  color: #a43a30;
}

/* Form actions */
.form-actions {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 9px;
  margin-top: 22px;
}

.cancel-button,
.submit-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  padding: 10px 16px;
  border: 1px solid transparent;
  border-radius: 7px;
  font-family: inherit;
  font-size: 0.78rem;
  font-weight: 800;
  text-decoration: none;
  cursor: pointer;
  transition: background 150ms ease, border-color 150ms ease;
}

.cancel-button {
  border-color: #eee6de;
  background: #fff;
  color: #29231f;
}

.cancel-button:hover {
  background: #f7f1eb;
}

.submit-button {
  background: #d4442f;
  color: #fff;
}

.submit-button:hover:not(:disabled) {
  background: #b93625;
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: wait;
}

@media (max-width: 600px) {
  .form-page {
    width: calc(100% - 32px);
    margin-top: 28px;
  }

  .restaurant-form {
    padding: 24px 18px;
  }

  .form-grid {
    grid-template-columns: 1fr;
    gap: 18px;
  }

  .restaurant-form .full-width {
    grid-column: auto;
  }

  .form-heading h1 {
    font-size: 2.2rem;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .cancel-button,
  .submit-button {
    width: 100%;
  }
}
</style>
