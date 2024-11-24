<script lang="ts">
import { RouterView } from 'vue-router'

import { go, go_outwards } from './scripts/routing';

export default {
  components: {
    RouterView
  },
  setup() {
    return {
      go, go_outwards
    }
  }
}
</script>

<template>
  <main class="dp-flex fd-c jc-sb" @contextmenu.prevent="">
    <RouterView />
  </main>

</template>
