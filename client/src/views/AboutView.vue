<script setup>
const features = [
  {
    number: '01',
    title: 'Explore',
    description:
      'Browse restaurant information, including location, cuisine, and inspection history.',
    badge: 'READ',
    link: '/restaurants',
    linkText: 'Explore restaurants',
  },
  {
    number: '02',
    title: 'Search',
    description:
      'Find restaurants quickly using search and filters for borough, cuisine, and inspection grade.',
    badge: 'SEARCH · FILTER',
    link: '/restaurants',
    linkText: 'Find a restaurant',
  },
  {
    number: '03',
    title: 'Manage',
    description:
      'Create, update, and delete restaurant records through an easy-to-use interface.',
    badge: 'CRUD OPERATIONS',
    link: '/add-restaurant',
    linkText: 'Add a restaurant',
  },
]

const technologies = [
  'Vue.js',
  'Node.js',
  'Express.js',
  'MongoDB',
  'CSS',
  'JavaScript',
]
</script>

<template>
  <div class="about-page">
    <section class="about-intro">
      <span class="eyebrow">GET TO KNOW US</span>
      <h1>About <span>RestoHub</span></h1>
      <p>
        RestoHub is a restaurant directory and database management web
        application designed to make restaurant information easier to
        explore, search, and manage. Built with the MEVN stack, it
        connects a Vue.js interface to a Node.js and Express.js backend
        powered by MongoDB.
      </p>

      <div class="intro-actions">
        <RouterLink to="/restaurants" class="button button-primary">
          Explore restaurants <span aria-hidden="true">→</span>
        </RouterLink>
        <RouterLink to="/" class="button">
          Back to home
        </RouterLink>
      </div>
    </section>

    <section class="features-section">
      <div class="section-heading">
        <div>
          <span class="eyebrow">WHAT YOU CAN DO</span>
          <h2>One directory, three ways to use it.</h2>
          <p>Everything you need to explore and maintain restaurant records.</p>
        </div>
      </div>

      <div class="about-cards">
        <article
          v-for="feature in features"
          :key="feature.number"
          class="about-card"
        >
          <div class="card-number">{{ feature.number }}</div>
          <h3>{{ feature.title }}</h3>
          <p>{{ feature.description }}</p>
          <span class="db-badge">{{ feature.badge }}</span>
          <RouterLink :to="feature.link" class="text-link">
            {{ feature.linkText }} <span aria-hidden="true">→</span>
          </RouterLink>
        </article>
      </div>
    </section>

    <section class="about-bottom">
      <div class="about-copy">
        <span class="eyebrow">HOW IT WORKS</span>
        <h2>Built around the restaurant record.</h2>
        <p>
          RestoHub uses MongoDB to store restaurant documents. The
          Express.js backend handles API requests, while Vue.js displays
          the information and provides the interface for restaurant
          management.
        </p>
        <p>
          Restaurant information is retrieved from the database, allowing
          users to browse records, apply filters, view details, and manage
          restaurant entries.
        </p>

        <h3>Powered by the MEVN stack</h3>
        <div class="stack-list">
          <span v-for="technology in technologies" :key="technology">
            {{ technology }}
          </span>
        </div>
      </div>

      <div class="code-card">
        <div class="code-head">
          <span class="code-dot"></span>
          <span class="code-dot"></span>
          <span class="code-dot"></span>
          <span class="code-title">restaurants — sample document</span>
        </div>

        <pre><code>{
  <span class="code-key">"_id"</span>: <span class="code-string">"ObjectId(...)"</span>,
  <span class="code-key">"restaurant_id"</span>: <span class="code-string">"30075445"</span>,
  <span class="code-key">"name"</span>: <span class="code-string">"Morris Park Bake Shop"</span>,
  <span class="code-key">"borough"</span>: <span class="code-string">"Bronx"</span>,
  <span class="code-key">"cuisine"</span>: <span class="code-string">"Bakery"</span>,
  <span class="code-key">"address"</span>: {
    <span class="code-key">"building"</span>: <span class="code-string">"1007"</span>,
    <span class="code-key">"street"</span>: <span class="code-string">"Morris Park Ave"</span>,
    <span class="code-key">"zipcode"</span>: <span class="code-string">"10462"</span>
  },
  <span class="code-key">"grades"</span>: [
    {
      <span class="code-key">"grade"</span>: <span class="code-string">"A"</span>,
      <span class="code-key">"score"</span>: 2
    }
  ]
}</code></pre>
        <p class="sample-note">
          Example only · Illustrates the structure of a restaurant record
        </p>
      </div>
    </section>

    <section class="about-cta">
      <div>
        <span class="eyebrow">START EXPLORING</span>
        <h2>Your next restaurant discovery starts here.</h2>
        <p>Explore the directory or contribute a new restaurant record.</p>
      </div>
      <div class="cta-actions">
        <RouterLink to="/restaurants" class="button button-light">
          Browse directory →
        </RouterLink>
        <RouterLink to="/add-restaurant" class="button button-outline">
          + Add restaurant
        </RouterLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.about-page {
  --about-charcoal: #1c1b19;
  --about-red: #c94a2f;
  --about-muted: #6b665f;
  --about-sand: #efe9e1;
  color: var(--about-charcoal);
}

.about-intro {
  max-width: 790px;
  padding: 27px 0 42px;
}

.eyebrow {
  display: inline-block;
  color: var(--about-red);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.about-intro h1 {
  margin: 13px 0 18px;
  font-size: clamp(36px, 5vw, 52px);
  line-height: 1.1;
  letter-spacing: -0.045em;
}

.about-intro h1 span {
  color: var(--about-red);
}

.about-intro > p {
  max-width: 720px;
  margin: 0;
  color: var(--about-muted);
  font-size: 17px;
  line-height: 1.85;
}

.intro-actions,
.cta-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 25px;
}

.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  min-height: 43px;
  padding: 0 17px;
  border: 1px solid var(--about-sand);
  border-radius: 8px;
  background: #fff;
  color: var(--about-charcoal);
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  transition: transform 0.2s, background 0.2s;
}

.button:hover {
  transform: translateY(-1px);
}

.button-primary {
  border-color: var(--about-red);
  background: var(--about-red);
  color: #fff;
}

.button-primary:hover {
  background: #aa3823;
}

.features-section {
  padding: 34px 0 63px;
  border-top: 1px solid var(--about-sand);
}

.section-heading {
  margin-bottom: 22px;
}

.section-heading h2 {
  margin: 8px 0;
  font-size: clamp(23px, 3vw, 30px);
  letter-spacing: -0.025em;
}

.section-heading p {
  margin: 0;
  color: var(--about-muted);
  font-size: 14px;
}

.about-cards {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.about-card {
  display: flex;
  min-width: 0;
  flex-direction: column;
  align-items: flex-start;
  padding: 25px;
  border: 1px solid var(--about-sand);
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 2px 14px rgba(33, 29, 24, 0.035);
  transition: transform 0.2s, box-shadow 0.2s;
}

.about-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 9px 25px rgba(33, 29, 24, 0.08);
}

.card-number {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  border-radius: 9px;
  background: #f7e8e2;
  color: var(--about-red);
  font-size: 12px;
  font-weight: 800;
}

.about-card h3 {
  margin: 19px 0 7px;
  font-size: 19px;
}

.about-card > p {
  flex: 1;
  margin: 0 0 20px;
  color: var(--about-muted);
  font-size: 13px;
  line-height: 1.8;
}

.db-badge {
  display: inline-block;
  margin-bottom: 19px;
  padding: 5px 8px;
  border-radius: 5px;
  background: #eee9e2;
  color: #5b554e;
  font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
  font-size: 10px;
}

.text-link {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: var(--about-red);
  font-size: 13px;
  font-weight: 750;
  text-decoration: none;
}

.text-link:hover {
  text-decoration: underline;
}

.about-bottom {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  align-items: start;
  gap: 45px;
  padding: 37px 0 65px;
  border-top: 1px solid var(--about-sand);
}

.about-copy h2 {
  margin: 11px 0 15px;
  font-size: clamp(25px, 3vw, 31px);
  line-height: 1.25;
  letter-spacing: -0.03em;
}

.about-copy > p {
  color: var(--about-muted);
  font-size: 14px;
  line-height: 1.9;
}

.about-copy h3 {
  margin: 27px 0 12px;
  font-size: 16px;
}

.stack-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.stack-list span {
  padding: 7px 11px;
  border: 1px solid var(--about-sand);
  border-radius: 7px;
  background: #fff;
  font-size: 12px;
  font-weight: 600;
}

.code-card {
  min-width: 0;
  overflow: hidden;
  border: 1px solid #34322f;
  border-radius: 12px;
  background: #1d1c1a;
  color: #dedbd7;
  box-shadow: 0 8px 25px rgba(28, 27, 25, 0.1);
}

.code-head {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 15px 17px;
  border-bottom: 1px solid #363431;
}

.code-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #77716a;
}

.code-title {
  overflow: hidden;
  margin-left: 7px;
  color: #aaa49c;
  font-family: ui-monospace, Consolas, monospace;
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.code-card pre {
  overflow-x: auto;
  margin: 0;
  padding: 20px;
  font: 11px/1.9 ui-monospace, SFMono-Regular, Consolas, monospace;
}

.code-key {
  color: #e07a62;
}

.code-string {
  color: #9fc490;
}

.sample-note {
  margin: 0;
  padding: 12px 18px;
  border-top: 1px solid #363431;
  color: #aaa49c;
  font-size: 10px;
}

.about-cta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 25px;
  padding: 34px;
  border-radius: 13px;
  background: var(--about-charcoal);
  color: #fff;
}

.about-cta h2 {
  max-width: 470px;
  margin: 8px 0;
  font-size: clamp(23px, 3vw, 29px);
  line-height: 1.25;
}

.about-cta p {
  margin: 0;
  color: #c9c2bb;
  font-size: 13px;
}

.about-cta .cta-actions {
  flex-shrink: 0;
  margin-top: 0;
}

.button-light {
  border-color: #fff;
  background: #fff;
  color: var(--about-charcoal);
}

.button-outline {
  border-color: #514b45;
  background: transparent;
  color: #fff;
}

@media (max-width: 850px) {
  .about-cards {
    grid-template-columns: 1fr;
  }

  .about-card {
    min-height: 0;
  }

  .about-bottom {
    grid-template-columns: 1fr;
    gap: 28px;
  }

  .about-cta {
    align-items: flex-start;
    flex-direction: column;
  }

  .about-cta .cta-actions {
    flex-wrap: wrap;
  }
}

@media (max-width: 480px) {
  .about-intro {
    padding-top: 10px;
  }

  .about-intro > p {
    font-size: 15px;
  }

  .intro-actions,
  .intro-actions .button {
    width: 100%;
  }

  .about-card {
    padding: 21px;
  }

  .about-cta {
    padding: 24px;
  }

  .about-cta .cta-actions,
  .about-cta .button {
    width: 100%;
  }
}
</style>
