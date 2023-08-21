<script lang="ts">
  import { v4 as uuidv4 } from 'uuid';
  import Tooltip from '$components/Tooltip.svelte';
  import { isTranslatedLeaf, makeAPILanguageLeafTranslated } from '$baselib/api/languageitem';

  import { createEventDispatcher, getContext } from 'svelte';
  import type { Unsubscriber } from 'svelte/store';
  import type { TranslationProviderContext } from './TranslationProvider.svelte';

  export let id = uuidv4();

  export let label = '';
  export let name: string;
  export let hideTooltip = false;
  export let fallback = '';

  const ctx = getContext<TranslationProviderContext>('translation');
  const dispatch = createEventDispatcher();

  let active = '';
  let value: string = '';

  let unsubscribeCtx: Unsubscriber;

  unsubscribeCtx = ctx.subscribe((val) => {
    if (val.loading) return;
    active = active || val.languages[0]?.language_ID;
    val.data[name] ??= makeAPILanguageLeafTranslated(
      Object.fromEntries(val.languages.map((lang) => [lang.language_ID, fallback.replace(/<-.+->/g, '')])),
      false,
    );
    if (!value) {
      value = val.data[name][active] ?? '';
    }
    if (active && value && unsubscribeCtx) unsubscribeCtx();
  });

  function set(val: string) {
    if (!isTranslatedLeaf($ctx.data?.[name])) return;

    $ctx.data[name][active] = val;
  }
</script>

<div class="flex flex-row space-x-2 justify-between mb-2">
  <label class="text-sm" for={id}>{label}</label>
  <div class="flex flex-row space-x-2">
    {#each $ctx.languages as lang}
      <Tooltip {hideTooltip} title={lang.language_title}>
        <button
          type="button"
          class="flex flex-row items-center justify-center 
          rounded-full w-6 h-6 overflow-hidden 
          focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-2 focus-visible:ring-primary"
          tabindex="0"
          on:click={() => {
            active = lang.language_ID;
            value = $ctx.data[name][active] ?? '';
            dispatch('switch', active);
          }}
        >
          <img
            class="object-cover object-center w-9 h-9
            {active === lang.language_ID ? '' : 'grayscale hover:filter-none transition'}"
            width="auto"
            src={'/flags/' + lang.language_ID + '.png'}
            alt={lang.language_title}
          />
        </button>
      </Tooltip>
    {/each}
  </div>
</div>

<slot {active} {value} loading={$ctx.loading} {set} {id} />
<input hidden {name} value={$ctx.techValue(name)} tabindex="-1" aria-hidden="true" />
