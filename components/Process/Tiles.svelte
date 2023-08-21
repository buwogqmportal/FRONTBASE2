<script lang="ts" context="module">
  export type TileData<T = any> = {
    id?: string;
    data?: T;
    icon?: string;
    title?: string;
    subtitle?: string;
  };

  export function toTileData<T>(
    data: unknown[],
    paths: {
      id?: string;
      data?: string;
      icon?: string;
      title?: string;
      subtitle?: string;
    },
  ): TileData<T>[] {
    return data.map((data) => ({
      id: getProperty(data, paths.id) as string,
      data: getProperty(data, paths.data) as T,
      icon: getProperty(data, paths.icon) as string,
      title: getProperty(data, paths.title) as string,
      subtitle: getProperty(data, paths.subtitle) as string,
    }));
  }
</script>

<script lang="ts">
  import { evalMaybeFunction, getProperty, listToClass, type MaybeFunction } from '$baselib/util';
  import Icon from '$components/Icon.svelte';
  import { createEventDispatcher, getContext } from 'svelte';
  import { writable, type Writable } from 'svelte/store';

  export let data: TileData[];
  export let selected: (data: TileData) => boolean = () => false;
  export let disabled: MaybeFunction<boolean, [TileData]> = false;
  export let list = false;

  const dispatch = createEventDispatcher();

  const narrow = (getContext('narrow') as Writable<boolean>) ?? writable(false);
</script>

{#if list}
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
    {#each data as tile}
      <button
        class={['flex flex-row items-center text-left gap-x-2', selected(tile) && 'text-primary'].reduce(listToClass)}
        disabled={evalMaybeFunction(disabled, tile)}
        on:click={() => dispatch('select', tile)}
      >
        <div
          class={[
            'shrink-0 flex flex-col items-center justify-center border-[1.5px]',
            selected(tile) && 'border-primary',
            'rounded-lg p-2 w-12 h-12 truncate',
          ].reduce(listToClass)}
        >
          {#if tile.icon}
            <Icon iconPath={tile.icon} class="w-12 h-12" />
          {/if}
        </div>
        <div>
          {#if tile.title}
            <h4>{tile.title}</h4>
          {/if}
          {#if tile.subtitle}
            <p>{tile.subtitle}</p>
          {/if}
        </div>
      </button>
    {/each}
  </div>
{:else}
  <div class="flex flex-row flex-wrap -mx-2 gap-y-4 justify-center">
    {#each data as tile}
      <div
        class={['px-2', $narrow ? 'w-6/12 md:w-4/12 lg:w-3/12 xl:w-2/12' : 'w-6/12 lg:w-4/12 xl:w-3/12'].reduce(
          listToClass,
        )}
      >
        <button
          class={[
            'h-full flex flex-col items-center justify-center space-y-1 border-[1.5px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-2 focus-visible:ring-primary',
            !disabled && 'hover:bg-secondary-lighter/50',
            selected(tile) ? 'border-primary text-primary' : 'border-secondary text-secondary',
            'rounded-lg p-2 w-full py-8 transition-colors',
            disabled !== true && evalMaybeFunction(disabled, tile) && 'line-through text-opacity-70 border-opacity-70',
          ].reduce(listToClass)}
          disabled={evalMaybeFunction(disabled, tile)}
          on:click={() => dispatch('select', tile)}
        >
          {#if tile.icon}
            <Icon iconPath={tile.icon} class="w-8 h-8" />
          {/if}
          {#if tile.title}
            <div class="text-2xl font-bold">
              {tile.title}
            </div>
          {/if}
          {#if tile.subtitle}
            <div class="mt-1">
              {tile.subtitle}
            </div>
          {/if}
        </button>
      </div>
    {/each}
  </div>
{/if}
