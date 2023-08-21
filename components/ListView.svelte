<script lang="ts">
  // svelte
  import { _ } from 'svelte-i18n';

  // lib
  import { parseColuser, type APIColuser, type APIColuserParsed, type TypeDisplay } from '$baselib/api/coluser';
  import { dateFromAPIDate, formatters } from '$baselib/formater';
  import type { APISearchResultHit } from '$baselib/api/search';
  import { processViewActions, type ViewAction } from '$baselib/viewAction';

  // components
  import { selectValueStore } from './Form/LocalSelect.svelte';
  import Card from '$components/Card/Card.svelte';
  import CardDivider from '$components/Card/CardDivider.svelte';
  import CardIconProperty from '$components/Card/CardIconProperty.svelte';
  import CardTextProperty from '$components/Card/CardTextProperty.svelte';
  import DeadlineBadge from './DeadlineBadge.svelte';

  // icons
  import ArrowIcon from '$icons/arrow.svg?component';
  import ProjectIcon from '$icons/project.svg?component';
  import FloormapIcon from '$icons/floormap.svg?component';
  import PhoneIcon from '$icons/phone.svg?component';
  import MailIcon from '$icons/mail.svg?component';
  import FingerprintIcon from '$icons/fingerprint.svg?component';
  import StaffIcon from '$icons/staff.svg?component';
  import Link from './Link.svelte';
  import Icon from './Icon.svelte';
  import Button from './Form/Button.svelte';

  export let data: APISearchResultHit[] = [];
  export let cols: APIColuser[] = [];
  export let link: ((hit: Record<string, string>) => string) | false;
  export let actions: ViewAction[] = [];

  function makeColText(col: APIColuserParsed, hit: Record<string, string>, seperator = ' · '): string {
    return col.display.values
      .map((classID) => hit[classID])
      .filter((text) => text)
      .join(seperator);
  }

  type ProcessedCols = TypeDisplay & {
    title: string;
    text: string;
    raw: Record<string, string>;
    classID: string;
  };

  type ProcessedHit = {
    raw: Record<string, string>;
    image?: string;
    title?: string;
    visibleCells: ProcessedCols[];
    iconCells: ProcessedCols[];
  };

  let processed: ProcessedHit[];
  $: processed = (function processHit(cols: APIColuser[], hits: APISearchResultHit[]): ProcessedHit[] {
    const parsedCols = cols.map(parseColuser);

    const image = parsedCols.find((col) => col.display.type === 'image');
    const title = parsedCols.find((col) => col.display.type === 'title');
    const visibleCols = parsedCols.filter((col) => !['icon', 'image', 'title', 'hidden'].includes(col.display.type));
    const iconCols = parsedCols.filter((col) => col.display.type === 'icon');

    return hits
      .map((hit) => {
        const formated: Record<string, string> = {};

        for (const col of parsedCols) {
          const formater = formatters[col.col_type];
          const value: string = hit.document[col.col_class_ID];

          if (formater) {
            formated[col.col_class_ID] = formater(value);
          }
        }

        return [hit.document, { ...hit.document, ...formated }];
      })
      .map(([raw, hit]) => ({
        title: title ? makeColText(title, hit, ' ') : '',
        image: image && hit[image.col_class_ID],
        raw,
        visibleCells: visibleCols
          .map((col) => ({
            ...col.display,
            title: col.col_title,
            text: makeColText(col, hit),
            raw: col.display.values.reduce((r, classID) => ({ ...r, [classID]: raw[classID] }), {}),
            classID: col.col_class_ID,
          }))
          .filter((col) => col.text),
        iconCells: iconCols
          .map((col) => ({
            ...col.display,
            title: col.col_title,
            text: makeColText(col, hit),
            raw: col.display.values.reduce((r, classID) => ({ ...r, [classID]: raw[classID] }), {}),
            classID: col.col_class_ID,
          }))
          .filter((col) => col.text),
      }));
  })(cols, data);

  export let noData = false;
</script>

<div class="grid gap-4 grid-cols-1 xl:grid-cols-2">
  {#each processed as hit}
    <Card {noData} image={hit.image}>
      <svelte:fragment slot="title">
        {#if link && link(hit.raw)}
          <a href={link(hit.raw)}>{hit.title}</a>
        {:else}
          {hit.title}
        {/if}
      </svelte:fragment>
      <svelte:fragment slot="icon">
        {#if link && link(hit.raw)}
          <div class="rotate-180 text-primary">
            <a href={link(hit.raw)}>
              <ArrowIcon />
            </a>
          </div>
        {/if}
      </svelte:fragment>

      {#each hit.visibleCells as cell}
        {#if cell.type === 'subtitle'}
          <CardTextProperty class="font-semibold text-left">
            <svelte:fragment slot="value">
              {cell.text}
            </svelte:fragment>
          </CardTextProperty>
        {:else if cell.type === 'text'}
          <CardTextProperty>
            <svelte:fragment slot="value">
              {cell.text}
            </svelte:fragment>
          </CardTextProperty>
        {:else if cell.type === 'lang'}
          <CardTextProperty>
            <svelte:fragment slot="value">
              {cell.title}: {$selectValueStore(cell.info ?? cell.classID, cell.text, false, 'value')}
            </svelte:fragment>
          </CardTextProperty>
        {:else if cell.type === 'deadline'}
          <CardTextProperty>
            <svelte:fragment slot="value">
              {cell.title}: {cell.text}

              {#if dateFromAPIDate(cell.raw[cell.classID])}
                <DeadlineBadge date={dateFromAPIDate(cell.raw[cell.classID])} />
              {/if}
            </svelte:fragment>
          </CardTextProperty>
        {:else}
          <CardTextProperty>
            <svelte:fragment slot="value">
              {cell.title}: {cell.text}
            </svelte:fragment>
          </CardTextProperty>
        {/if}
      {/each}

      {#each processViewActions(actions, hit.raw) as { link, callback, style, icon, text }}
        {#if link}
          <Link type="button" color={style} href={link}><Icon iconPath={icon} class="inline-block mr-2" /> {text}</Link>
        {:else if callback}
          <Button type="button" color={style} on:click={callback}
            ><Icon iconPath={icon} class="inline-block mr-2" /> {text}</Button
          >
        {/if}
      {/each}

      {#if hit.visibleCells.length > 0 && hit.iconCells.length > 0}
        <CardDivider />
      {/if}

      {#each hit.iconCells as cell}
        <CardIconProperty>
          <svelte:fragment slot="icon">
            {#if cell.info === 'staff'}
              <StaffIcon />
            {:else if cell.info === 'building'}
              <ProjectIcon />
            {:else if cell.info === 'floormap'}
              <FloormapIcon />
            {:else if cell.info === 'phone'}
              <PhoneIcon />
            {:else if cell.info === 'project'}
              <ProjectIcon />
            {:else if cell.info === 'mail'}
              <MailIcon />
            {:else if cell.info === 'id'}
              <FingerprintIcon />
            {:else}
              <div class="w-[18px] h-[18px]" />
            {/if}
          </svelte:fragment>

          {cell.text}
        </CardIconProperty>
      {/each}
    </Card>
  {/each}
</div>
