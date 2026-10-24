<script setup>
import { usePlayerProfile } from '../composables/usePlayerProfile.js'
import { POINTS_BY_ATTEMPTS, FIRST_TRY_BONUS, STREAK_BONUS_CAP_MULTIPLIER } from '../utils/scoring.js'
import AnimatedNumber from './AnimatedNumber.vue'

const { profile, levelInfo, allBadges, unlockedBadgeIds } = usePlayerProfile()
</script>

<template>
  <div class="profile">
    <header class="profile-header">
      <h1>Progreso de {{ profile.playerName }}</h1>
    </header>

    <div class="level-card card-surface">
      <div class="level-row">
        <span class="level-badge">Nivel {{ levelInfo.level }}</span>
        <span class="level-xp"><AnimatedNumber :value="levelInfo.currentXp" /> / {{ levelInfo.neededXp }} XP</span>
      </div>
      <div class="level-track" role="progressbar" :aria-valuenow="levelInfo.percent" aria-valuemin="0" aria-valuemax="100">
        <div class="level-fill" :style="{ width: levelInfo.percent + '%' }"></div>
      </div>
    </div>

    <dl class="stats-grid">
      <div class="stats-item card-surface">
        <dt>Récord personal</dt>
        <dd><AnimatedNumber :value="profile.bestScore" /></dd>
      </div>
      <div class="stats-item card-surface">
        <dt>Mejor racha</dt>
        <dd><AnimatedNumber :value="profile.bestStreak" /></dd>
      </div>
      <div class="stats-item card-surface">
        <dt>Tarjetas resueltas</dt>
        <dd><AnimatedNumber :value="profile.totalCardsSolved" /></dd>
      </div>
      <div class="stats-item card-surface">
        <dt>Aciertos al primer intento</dt>
        <dd><AnimatedNumber :value="profile.totalFirstTry" /></dd>
      </div>
    </dl>

    <section class="rules-section card-surface">
      <h2>Cómo se puntúa</h2>
      <ul class="rules-list">
        <li>Acierto al 1er intento: <strong>{{ POINTS_BY_ATTEMPTS[1] }} pts</strong> + {{ FIRST_TRY_BONUS }} de bonus.</li>
        <li>Acierto al 2º intento: <strong>{{ POINTS_BY_ATTEMPTS[2] }} pts</strong>.</li>
        <li>Acierto al 3er intento: <strong>{{ POINTS_BY_ATTEMPTS[3] }} pts</strong>.</li>
        <li>Fallar los 3 intentos: <strong>0 pts</strong> (y se reinicia tu racha).</li>
        <li>
          Racha de aciertos consecutivos: multiplicador creciente hasta
          <strong>x{{ STREAK_BONUS_CAP_MULTIPLIER }}</strong>.
        </li>
      </ul>
    </section>

    <section class="badges-section">
      <h2>Insignias</h2>
      <ul class="badges-grid">
        <li
          v-for="badge in allBadges"
          :key="badge.id"
          class="badge-card card-surface"
          :class="{ 'badge-card--locked': !unlockedBadgeIds.has(badge.id) }"
        >
          <span class="badge-card-icon" aria-hidden="true">{{ unlockedBadgeIds.has(badge.id) ? badge.icon : '🔒' }}</span>
          <span class="badge-card-name">{{ badge.name }}</span>
          <span class="badge-card-desc">{{ badge.description }}</span>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.profile {
  max-width: 820px;
  margin: 0 auto;
  padding: var(--space-8) var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.level-card {
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.level-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.level-badge {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 1.2rem;
  color: var(--color-primary);
}

.level-xp {
  font-size: 0.9rem;
  color: var(--color-text-muted);
}

.level-track {
  height: 12px;
  border-radius: 999px;
  background: var(--color-surface-muted);
  overflow: hidden;
}

.level-fill {
  height: 100%;
  background: var(--color-xp);
  border-radius: 999px;
  transition: width 0.4s ease;
}

.stats-grid {
  margin: 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-3);
}

.stats-item {
  padding: var(--space-4);
  text-align: center;
}

.stats-item dt {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.stats-item dd {
  margin: 0.2rem 0 0;
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 800;
}

.rules-section {
  padding: var(--space-5);
}

.rules-section h2 {
  margin: 0 0 var(--space-2);
  font-size: 1.1rem;
}

.rules-list {
  margin: 0;
  padding-left: var(--space-5);
  color: var(--color-text-muted);
  font-size: 0.9rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.badges-section h2 {
  margin-bottom: var(--space-3);
  font-size: 1.1rem;
}

.badges-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: var(--space-3);
}

.badge-card {
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.25rem;
}

.badge-card--locked {
  opacity: 0.5;
}

.badge-card-icon {
  font-size: 1.8rem;
}

.badge-card-name {
  font-weight: 700;
  font-size: 0.9rem;
}

.badge-card-desc {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
