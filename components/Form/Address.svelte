<script lang="ts">
  // node modules
  import { json, _ } from 'svelte-i18n';

  //lib

  //components
  import Input from './Input.svelte';
  import Select, { type SelectOption } from './Select.svelte';
  import { googleAPIKey } from '$baselib/config';
  import { browser } from '$app/env';
  import { analytics } from '$baselib/stores';

  $: countries = Object.entries($json('countries')).map(([value, label]) => ({ value, label })) as SelectOption[];

  export let prefix: string;
  export let errorMessage: (string: string) => string = null;

  export let street = '';
  export let zipcode = '';
  export let city = '';
  export let state = '';
  export let country = '';

  export let hideState = false;
  export let hideCountry = false;

  let autocomplete: google.maps.places.Autocomplete;
  let address1Field: HTMLInputElement;

  function initAutocomplete() {
    autocomplete = new google.maps.places.Autocomplete(address1Field, {
      fields: ['address_components', 'geometry'],
      types: ['address'],
    });

    // When the user selects an address from the drop-down, populate the
    // address fields in the form.
    autocomplete.addListener('place_changed', fillInAddress);
  }

  function fillInAddress() {
    const place = autocomplete.getPlace();
    let street_name = '';
    let street_number = '';

    for (const component of place.address_components as google.maps.GeocoderAddressComponent[]) {
      const componentType = component.types[0];

      switch (componentType) {
        case 'street_number':
          street_number = component.long_name;
          break;

        case 'route':
          street_name = component.short_name;
          break;

        case 'postal_code':
          zipcode = component.long_name;
          break;

        case 'postal_code_suffix':
          zipcode = component.long_name;
          break;

        case 'locality':
          city = component.long_name;
          break;

        case 'administrative_area_level_1': {
          state = component.long_name;
          break;
        }

        case 'country':
          country = component.short_name;
          break;
      }
    }

    address1Field.value = street_name + ' ' + street_number;
  }

  $: if (browser && $analytics.tracking && !autocomplete && address1Field) {
    loadGoogle().then(initAutocomplete);
  }

  async function loadGoogle() {
    if (!browser) return;

    let script = document.scripts.namedItem('googleapi');

    if (!script) {
      await new Promise((res, rej) => {
        window['initGoogle'] = res;

        script = document.createElement('script');
        script.id = 'googleapi';
        script.addEventListener('error', rej);
        script.async = true;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${googleAPIKey}&libraries=places&callback=initGoogle`;

        document.head.append(script);
      });

      // https://developers.google.com/maps/documentation/javascript/dynamic-loading

      delete window['initGoogle'];
    } else if (window['initGoogle']) {
      await new Promise((res, rej) => {
        window['initGoogle'] = (arg: unknown) => {
          res(arg);
          window['initGoogle'](arg);
        };
        script.addEventListener('error', rej);
      });
    }
  }
</script>

<Input
  label={$_(`form.street`)}
  placeholder={$_(`form.street_placeholder`)}
  errormsg={errorMessage?.(`${prefix}_street`)}
  name="{prefix}_street"
  bind:value={street}
  bind:input={address1Field}
/>
<div class="flex flex-row justify-between">
  <Input
    class="flex-grow pr-2"
    label={$_(`form.zipcode`)}
    placeholder={$_(`form.zipcode_placeholder`)}
    errormsg={errorMessage?.(`${prefix}_zipcode`)}
    name="{prefix}_zipcode"
    bind:value={zipcode}
  />
  <Input
    class="flex-grow pl-2"
    label={$_(`form.city`)}
    placeholder={$_(`form.city_placeholder`)}
    errormsg={errorMessage?.(`${prefix}_city`)}
    name="{prefix}_city"
    bind:value={city}
  />
</div>
{#if !hideState}
  <Input
    label={$_(`form.state`)}
    placeholder={$_(`form.state`)}
    errormsg={errorMessage?.(`${prefix}_state`)}
    name="{prefix}_state"
    bind:value={state}
  />
{/if}
{#if !hideCountry}
  <Select
    label={$_(`form.country`)}
    placeholder={$_(`form.country`)}
    errormsg={errorMessage?.(`${prefix}_country`)}
    options={countries}
    name="{prefix}_country"
    bind:value={country}
  />
{/if}
