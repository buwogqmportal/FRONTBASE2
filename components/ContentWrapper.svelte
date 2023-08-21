<script lang="ts">
  import { _contentClass, _screenFull } from '$baselib/stores';
</script>

<div class="flex-grow flex flex-col px-6 {$_contentClass}" class:min-h-0={$_screenFull}>
  <slot />
</div>
