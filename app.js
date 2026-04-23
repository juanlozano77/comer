
const { createApp, ref, onMounted, nextTick, computed, watch } = Vue;

createApp({
  setup() {
    const chapters = ref([]);
    const currentChapter = ref(null);
    const chapterData = ref(null);
    const loading = ref(true);
    const error = ref('');
    const zoom = ref(Number(localStorage.getItem('readerZoom') || 100));

    const routeSlug = () => {
      const hash = window.location.hash || '';
      const match = hash.match(/^#\/chapter\/([a-z0-9_-]+)/i);
      return match ? match[1] : null;
    };

    const goHome = () => { window.location.hash = '#/'; };
    const openChapter = (slug) => { window.location.hash = `#/chapter/${slug}`; };

    const currentIndex = computed(() => {
      if (!currentChapter.value) return -1;
      return chapters.value.findIndex(c => c.slug === currentChapter.value.slug);
    });

    const prevChapter = computed(() => currentIndex.value > 0 ? chapters.value[currentIndex.value - 1] : null);
    const nextChapter = computed(() => currentIndex.value >= 0 && currentIndex.value < chapters.value.length - 1 ? chapters.value[currentIndex.value + 1] : null);

    const fetchJson = async (url) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`No se pudo cargar ${url}`);
      return await res.json();
    };

    const applyZoom = () => {
      const factor = zoom.value / 100;
      document.querySelectorAll('.page-scale').forEach(el => {
        el.style.transform = `scale(${factor})`;
      });
      document.querySelectorAll('.page-box').forEach(el => {
        el.style.width = `${738 * factor}px`;
        el.style.height = `${1041 * factor}px`;
        el.style.aspectRatio = 'auto';
      });
      localStorage.setItem('readerZoom', String(Math.round(zoom.value)));
    };

    const changeZoom = (delta) => {
      zoom.value = Math.max(30, Math.min(300, zoom.value + delta));
      nextTick(applyZoom);
    };

    const setFit = () => {
      const book = document.querySelector('.book');
      if (!book) return;
      const available = Math.max(320, book.clientWidth - 24);
      zoom.value = Math.max(30, Math.min(300, (available / 738) * 100));
      nextTick(applyZoom);
    };

    const loadRoute = async () => {
      loading.value = true;
      error.value = '';
      try {
        if (!chapters.value.length) {
          chapters.value = await fetchJson('./data/chapters.json');
        }
        const slug = routeSlug();
        if (!slug) {
          currentChapter.value = null;
          chapterData.value = null;
          loading.value = false;
          return;
        }
        currentChapter.value = chapters.value.find(c => c.slug === slug) || null;
        if (!currentChapter.value) {
          throw new Error('Capítulo no encontrado');
        }
        chapterData.value = await fetchJson(`./data/${slug}.json`);
        loading.value = false;
        await nextTick();
        applyZoom();
      } catch (e) {
        console.error(e);
        error.value = e.message || 'Error al cargar';
        loading.value = false;
      }
    };

    onMounted(async () => {
      window.addEventListener('hashchange', loadRoute);
      await loadRoute();
    });

    watch(zoom, () => nextTick(applyZoom));

    return {
      chapters, currentChapter, chapterData, loading, error, zoom,
      prevChapter, nextChapter,
      changeZoom, setFit, goHome, openChapter
    };
  },
  template: `
    <div class="app-shell">
      <template v-if="currentChapter">
        <div class="topbar">
          <button class="btn home-link" @click="goHome">← Índice</button>
          <div class="title-pill">{{ currentChapter.title }} · págs. {{ currentChapter.start }}–{{ currentChapter.end }}</div>
          <div class="controls">
            <button class="control-btn" @click="changeZoom(-10)">-</button>
            <span class="zoom-val">{{ Math.round(zoom) }}%</span>
            <button class="control-btn" @click="changeZoom(10)">+</button>
          </div>
          <button class="btn" @click="setFit">Auto</button>
          <div class="chapter-nav">
            <button v-if="prevChapter" class="btn" @click="openChapter(prevChapter.slug)">← {{ prevChapter.title }}</button>
            <button v-if="nextChapter" class="btn" @click="openChapter(nextChapter.slug)">{{ nextChapter.title }} →</button>
          </div>
        </div>

        <div class="page reader-wrap">
          <div v-if="loading" class="status">Cargando capítulo...</div>
          <div v-else-if="error" class="status">{{ error }}</div>
          <div v-else class="book">
            <div v-for="(pageHtml, idx) in chapterData.pagesHtml" :key="idx" v-html="pageHtml"></div>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="page">
          <section class="hero">
            <h1>Manual de Comercio Electrónico</h1>
            <p>Lector estático en Vue, listo para GitHub Pages. Cada capítulo se carga desde un JSON separado, con zoom manual tipo original y botón de ajuste automático.</p>
          </section>

          <div v-if="loading" class="status">Cargando índice...</div>
          <div v-else-if="error" class="status">{{ error }}</div>
          <div v-else class="chapter-grid">
            <a href="javascript:void(0)" class="chapter-card" v-for="ch in chapters" :key="ch.slug" @click="openChapter(ch.slug)">
              <div class="chapter-tag">{{ ch.start }}–{{ ch.end }}</div>
              <div class="chapter-name">{{ ch.title }}</div>
              <div class="chapter-meta">{{ ch.count }} páginas</div>
            </a>
          </div>
        </div>
      </template>
    </div>
  `
}).mount('#app');
