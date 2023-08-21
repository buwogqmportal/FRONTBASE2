<script lang="ts">
  // node modules
  import { _ } from 'svelte-i18n';

  // components
  import Input from '$components/Form/Input.svelte';
  import type { APIUser } from '$baselib/api/user';

  export let data: Partial<APIUser> = {};

  export let prename = data.user_personal_prename ?? '';
  export let lastname = data.user_personal_lastname ?? '';
  export let mail = data.user_mail ?? '';
  export let phone_1 = data.user_personal_phone_1 ?? '';
  export let phone_2 = data.user_personal_phone_2 ?? '';
</script>

<Input name="user_personal_prename" label={$_('me.form.prename')} bind:value={prename} />
<Input name="user_personal_lastname" label={$_('me.form.lastname')} bind:value={lastname} />

<Input name="user_personal_phone_1" label={$_('me.form.phone_1')} bind:value={phone_1} />

<Input name="user_personal_phone_2" label={$_('me.form.phone_2')} bind:value={phone_2} />

<Input disabled name="user_mail" label={$_('me.form.mail')} bind:value={mail} />
