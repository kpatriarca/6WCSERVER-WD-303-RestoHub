<script setup>
import { ref, onMounted } from 'vue'
import { restaurantService } from '../services/restaurantService'

const stats = ref({
  restaurants: 0,
  boroughs: 0,
  cuisines: 0,
  grades: 0,
})

const featuredRestaurants = ref([])
const loading = ref(true)
const error = ref('')

async function loadHomepage() {
  loading.value = true
  error.value = ''

  try {
    const [statsResponse, restaurantsResponse] = await Promise.all([
      restaurantService.getStats(),
      restaurantService.getRestaurants({ page: 1, limit: 6 }),
    ])

    stats.value = statsResponse.data
    featuredRestaurants.value = restaurantsResponse.data
  } catch (err) {
    error.value = err.message || 'Unable to load homepage data.'
  } finally {
    loading.value = false
  }
}

function formatDate(date) {
  if (!date) return 'Not available'

  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

onMounted(loadHomepage)
</script>

<template>
  <div class="home-page">
    <section class="hero">
      <div class="hero-content">
        <p class="eyebrow">YOUR GUIDE TO GREAT DINING</p>

        <h1>Discover restaurants.<br /><span>Explore more.</span></h1>

        <p class="hero-description">
          Explore restaurant information, discover different cuisines,
          and browse inspection records — all in one place.
        </p>

        <div class="hero-actions">
          <RouterLink to="/restaurants" class="primary-button">
            Explore Restaurants <span aria-hidden="true">→</span>
          </RouterLink>

          <RouterLink to="/add-restaurant" class="outline-button">
            + Add Restaurant
          </RouterLink>
        </div>
      </div>

      <div class="hero-art">
  <img
    class="hero-image"
    src="/assets/restaurant-hero.jpg"
    alt="Warm, inviting restaurant interior with tables prepared for dining"
  />

    <div
      v-if="featuredRestaurants.length"
      class="hero-restaurant-card"
    >
      <span class="hero-grade">
        {{ featuredRestaurants[0].currentGrade || '★' }}
      </span>

      <div class="hero-restaurant-info">
        <span class="hero-caption">FEATURED RESTAURANT</span>

        <strong>{{ featuredRestaurants[0].name }}</strong>

        <span>
          {{ featuredRestaurants[0].cuisine }}
          ·
          {{ featuredRestaurants[0].borough }}
        </span>
      </div>
    </div>
  </div>
    </section>

    <section class="stats-section" aria-label="Restaurant database statistics">
      <div class="section-heading">
        <div>
          <p class="eyebrow">THE DIRECTORY AT A GLANCE</p>
          <h2>Explore the numbers</h2>
        </div>
        <span class="live-label">
          <span class="live-dot"></span> Live database
        </span>
      </div>

      <p v-if="loading" class="status-message">
        Loading restaurant statistics...
      </p>

      <p v-else-if="error" class="status-message error-message">
        {{ error }}
        <button class="retry-button" @click="loadHomepage">Try again</button>
      </p>

      <div v-else class="stats-grid">
        <article class="stat-card">
          <span class="stat-icon">⌂</span>
          <p class="stat-label">Total Restaurants</p>
          <strong>{{ stats.restaurants.toLocaleString() }}</strong>
          <span class="stat-note">Restaurant records</span>
        </article>

        <article class="stat-card">
          <span class="stat-icon">⌖</span>
          <p class="stat-label">Boroughs</p>
          <strong>{{ stats.boroughs }}</strong>
          <span class="stat-note">Areas represented</span>
        </article>

        <article class="stat-card">
          <span class="stat-icon">♨</span>
          <p class="stat-label">Cuisines</p>
          <strong>{{ stats.cuisines }}</strong>
          <span class="stat-note">Types of cuisine</span>
        </article>

        <article class="stat-card">
          <span class="stat-icon">✓</span>
          <p class="stat-label">Grade Categories</p>
          <strong>{{ stats.grades }}</strong>
          <span class="stat-note">Inspection grades</span>
        </article>
      </div>
    </section>

    
<section class="featured-section">
  <div class="section-heading">
    <div>
      <h2>Explore Restaurants</h2>
      <p class="section-description">
        Most recently inspected restaurants in the database.
      </p>
    </div>

    <RouterLink class="text-link" to="/restaurants">
      View all <span aria-hidden="true">→</span>
    </RouterLink>
  </div>

  <p v-if="loading" class="status-message">
    Loading restaurant recommendations...
  </p>

  <p v-else-if="error" class="status-message error-message">
    {{ error }}
    <button class="retry-button" @click="loadHomepage">
      Try again
    </button>
  </p>

  <div
    v-else-if="featuredRestaurants.length"
    class="featured-grid"
  >
    <article
      v-for="restaurant in featuredRestaurants"
      :key="restaurant._id"
      class="featured-card"
    >
      <div class="featured-card-header">
        <span class="featured-cuisine">
          {{ restaurant.cuisine || 'Cuisine not listed' }}
        </span>

        <span
          class="grade-pill"
          :class="'grade-' + restaurant.currentGrade"
        >
          {{ restaurant.currentGrade || 'N/A' }}
        </span>
      </div>

      <h3>{{ restaurant.name }}</h3>

      <p class="featured-location">
        <span aria-hidden="true">♧</span>
        {{ restaurant.borough || 'Location unavailable' }}
      </p>

      <div class="featured-card-footer">
        <span>
          Score <strong>{{ restaurant.currentScore ?? 'N/A' }}</strong>
        </span>

        <RouterLink
          class="featured-link"
          :to="`/restaurants/${restaurant._id}`"
        >
          View Details <span aria-hidden="true">→</span>
        </RouterLink>
      </div>
    </article>
  </div>

  <div v-else class="empty-state">
    <h3>No restaurants available yet</h3>
    <p>Add your first restaurant to begin building the directory.</p>
    <RouterLink to="/add-restaurant" class="primary-button">
      Add Restaurant
    </RouterLink>
  </div>
</section>


    <section class="bottom-banner">
      <div>
        <p class="eyebrow">GROW THE DIRECTORY</p>
        <h2>Know a restaurant worth listing?</h2>
        <p>Help build a more complete directory by adding a restaurant record.</p>
      </div>

      <RouterLink to="/add-restaurant" class="banner-button">
        Add a Restaurant <span aria-hidden="true">→</span>
      </RouterLink>
    </section>
  </div>
</template>

<style scoped>
.home-page {
  color: #292522;
}

.hero {
  position: relative;
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  align-items: center;
  gap: 28px;
  min-height: 350px;
  padding: 42px 44px;
  overflow: hidden;
  border-radius: 22px;
  background: #f1eee9;
}

.hero-content {
  position: relative;
  z-index: 1;
}

.eyebrow {
  margin: 0 0 12px;
  color: #c94a2f;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.7px;
}

.hero h1 {
  margin: 0;
  color: #292522;
  font-size: clamp(32px, 4vw, 49px);
  line-height: 1.12;
  letter-spacing: -1.8px;
}

.hero h1 span {
  color: #c94a2f;
}

.hero-description {
  max-width: 470px;
  margin: 20px 0 25px;
  color: #706861;
  font-size: 15px;
  line-height: 1.8;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.primary-button,
.outline-button,
.banner-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  min-height: 45px;
  padding: 12px 18px;
  border-radius: 9px;
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  transition: transform 0.2s, background 0.2s;
}

.primary-button {
  background: #c94a2f;
  color: white;
}

.primary-button:hover {
  background: #a93822;
  transform: translateY(-2px);
}

.outline-button {
  border: 1px solid #e4d9d0;
  background: rgba(255, 255, 255, 0.85);
  color: #292522;
}

.outline-button:hover {
  background: #fff;
}

.hero-art {
  position: relative;
  min-width: 0;
  padding: 8px 0 24px;
}

.hero-image {
  display: block;
  width: 100%;
  height: 350px;
  object-fit: cover;
  border-radius: 18px;
  box-shadow: 0 12px 35px rgba(40, 29, 21, 0.12);
}

.hero-restaurant-card {
  position: absolute;
  bottom: 0;
  left: -24px;
  display: flex;
  align-items: center;
  gap: 14px;
  width: min(350px, 100%);
  padding: 16px;
  border: 1px solid #eee7df;
  border-radius: 13px;
  background: #fff;
  box-shadow: 0 12px 30px rgba(40, 29, 21, 0.14);
}

.hero-grade {
  display: grid;
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  place-items: center;
  border-radius: 8px;
  background: #e4f3e8;
  color: #267747;
  font-size: 20px;
  font-weight: 800;
}

.hero-restaurant-info {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 5px;
}

.hero-caption {
  color: #c94a2f;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.8px;
}

.hero-restaurant-info strong {
  overflow: hidden;
  color: #201e1b;
  font-size: 14px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hero-restaurant-info > span:last-child {
  overflow: hidden;
  color: #776e65;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stats-section,
.featured-section {
  margin-top: 46px;
}

.section-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 20px;
}

.section-heading .eyebrow {
  margin-bottom: 7px;
}

.section-heading h2,
.bottom-banner h2 {
  margin: 0;
  color: #292522;
  font-size: 25px;
  letter-spacing: -0.6px;
}

.live-label {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 11px;
  border: 1px solid #dce7dc;
  border-radius: 20px;
  color: #52745a;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.live-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #52945f;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.stat-card {
  padding: 21px;
  border: 1px solid #e6ebe6;
  border-radius: 14px;
  background: white;
  box-shadow: 0 4px 15px rgba(30, 55, 39, 0.025);
}

.stat-icon {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border-radius: 10px;
  background: #f9e9e4;
  color: #c94a2f;
  font-size: 20px;
}

.stat-label {
  margin: 16px 0 5px;
  color: #758177;
  font-size: 12px;
}

.stat-card strong {
  display: block;
  color: #292522;
  font-size: 30px;
  letter-spacing: -0.7px;
}

.stat-note {
  display: block;
  margin-top: 6px;
  color: #98a198;
  font-size: 11px;
}

.section-description {
  margin: 8px 0 0;
  color: #758177;
  font-size: 13px;
  line-height: 1.6;
}

.text-link {
  color: #c94a2f;
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
}

.text-link:hover,
.featured-link:hover {
  color: #a93822;
  text-decoration: underline;
}

.text-link,
.featured-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #c94a2f;
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
}

.featured-section {
  margin-top: 46px;
}

.featured-section .section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 24px;
}

.featured-section .section-heading h2 {
  margin: 0;
  color: #292522;
  font-size: 26px;
  font-weight: 750;
  letter-spacing: -0.6px;
}


.featured-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
  align-items: stretch;
}

.featured-card {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 202px;
  padding: 20px;
  border: 1px solid #eee5dc;
  border-radius: 13px;
  background: #fff;
  box-shadow: 0 4px 15px rgba(41, 37, 34, 0.025);
  transition: transform 0.2s, box-shadow 0.2s;
}

.featured-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 22px rgba(41, 37, 34, 0.06);
}

.featured-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.featured-card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin: 0 -20px;
}

.featured-symbol {
  box-sizing: border-box;
  display: grid;
  flex: 0 0 40px;
  width: 40px;
  height: 40px;
  place-items: center;
  border-radius: 14px;
  background: #f9e9e4;
  color: #c94a2f;
  font-size: 23px;
}

.grade-pill {
  display: inline-flex;
  flex-shrink: 0;
  min-width: 30px;
  min-height: 30px;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
  border-radius: 8px;
  background: #e2f3e8;
  color: #237448;
  font-size: 12px;
  font-weight: 800;
}

.grade-B {
  background: #fff0d9;
  color: #95600d;
}

.grade-C {
  background: #fde8e6;
  color: #b6382b;
}

.featured-cuisine {
  min-width: 0;
  margin: 0;
  padding: 0;
  background: transparent;
  color: #c94a2f;
  font-size: 11px;
  font-weight: 800;
  line-height: 1.5;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  overflow-wrap: anywhere;
}

.featured-card h3 {
  margin: 0;
  color: #292522;
  font-size: 16px;
  font-weight: 750;
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.featured-location {
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 22px 0 16px;
  color: #706861;
  font-size: 12px;
}

.featured-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: auto;
  padding: 14px 0;
  border-top: 1px solid #edf0ed;
  color: #756d65;
  font-size: 12px;
}

.featured-meta strong {
  flex-shrink: 0;
  color: #292522;
  font-size: 16px;
}

.inspection-date {
  margin: 0;
  padding-bottom: 17px;
  color: #898078;
  font-size: 11px;
}

.featured-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: auto;
  padding-top: 15px;
  border-top: 1px solid #edf0ed;
  color: #c94a2f;
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;
}

.featured-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid #eee8e1;
  color: #292522;
  font-size: 12px;
}

.featured-card-footer > span {
  white-space: nowrap;
}

.featured-card-footer strong {
  font-weight: 700;
}

.status-message,
.empty-state {
  padding: 28px;
  border: 1px solid #e6ebe6;
  border-radius: 14px;
  color: #68766a;
  text-align: center;
  line-height: 1.7;
}

.error-message {
  color: #a43a30;
}

.retry-button {
  display: block;
  margin: 12px auto 0;
  padding: 9px 14px;
  border: 1px solid #d5dfd6;
  border-radius: 8px;
  background: white;
  color: #294b35;
  font: inherit;
  cursor: pointer;
}

.empty-state h3 {
  color: #20382b;
}

.empty-state .primary-button {
  margin-top: 10px;
}

.bottom-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 25px;
  margin-top: 48px;
  padding: 30px 34px;
  border-radius: 16px;
  background: #292522;
  color: #fff;
}

.bottom-banner .eyebrow {
  color: #f0a18d;
}

.bottom-banner h2 {
  color: #fff;
  font-size: 22px;
}

.bottom-banner > div > p:last-child {
  margin: 9px 0 0;
  color: #e2d9d3;
  font-size: 13px;
  line-height: 1.7;
}

.banner-button {
  flex-shrink: 0;
  background: #fff;
  color: #292522
}

.banner-button:hover {
  background: #f1eee9;
}

@media (max-width: 850px) {
  .hero {
    grid-template-columns: 1fr 0.65fr;
    padding: 32px;
  }

  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .featured-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .featured-card:last-child:nth-child(odd) {
    grid-column: 1 / -1;
  }
}

@media (max-width: 600px) {
  .hero {
    grid-template-columns: 1fr;
    padding: 27px 22px;
  }

  .hero h1 {
    font-size: 36px;
  }

  .hero-art {
    padding-top: 10px;
  }

  .hero-image {
  	height: 260px;
	}

  .hero-restaurant-card {
    left: 8px;
    width: calc(100% - 16px);
  }

  .section-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .stats-grid,
  .featured-grid {
    grid-template-columns: 1fr;
  }

  .featured-card:last-child:nth-child(odd) {
    grid-column: auto;
  }

  .bottom-banner {
    align-items: flex-start;
    flex-direction: column;
    padding: 26px 22px;
  }

  .stats-section,
  .featured-section {
    margin-top: 36px;
  }

  .featured-section {
    margin-top: 36px;
  }

  .featured-section .section-heading {
    align-items: flex-start;
  }

  .featured-grid {
    grid-template-columns: 1fr;
  }

  .featured-card {
    min-height: 190px;
  }
  
}
</style>
