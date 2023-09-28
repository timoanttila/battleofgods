<script lang="ts">
  import TextInput from '$lib/TextInput.svelte'
  let botCheck = ''
</script>

<form class="my-10">
  <TextInput label="Name" maxlength={50} minlength={2} name="name" type="text" />
  <TextInput label="Email address" maxlength={100} minlength={6} name="email" type="email" />
  <TextInput label="How we can improve the article or the website" name="message" type="textarea" />
  <input type="email" name="emailVerification" value={botCheck} hidden />
</form>
