<script lang="ts">
  import {
    CognitoUserPool,
    CognitoUserAttribute,
    CognitoUser,
    AuthenticationDetails
  } from 'amazon-cognito-identity-js';
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
	import { SvelteToast } from '@zerodevx/svelte-toast';
  import { hero, heroDefault, user } from '$lib/store'
  import { toastMessage } from '$lib/toast'

  onMount(() => {
    if ($user?.sub) {
      goto('/profile')
    }
  })

  import {PUBLIC_COGNITO_CLIENT_ID, PUBLIC_COGNITO_USER_POOL_ID} from '$env/static/public'

  const poolData = { UserPoolId: PUBLIC_COGNITO_USER_POOL_ID, ClientId: PUBLIC_COGNITO_CLIENT_ID }
  const userPool = new CognitoUserPool(poolData);

  let Username = '', Password = '', Nickname = '', message = false, botCheck = '', verificationCode = '', loading = false, state = 1

  $: if (state) {
    let title = 'Sign In'
    if ([3,4].includes(state)) {
      title = 'Password reset'
    } else if (state === 2) {
      title = 'Create a new account'
    }

    $hero = {
      ...heroDefault,
      title,
      description: ''
    }
  }

  const register = async () => {
    if (botCheck) {
      return
    }

    if (!Username || !Password || !Nickname) {
      toastMessage('Please fill in all fields.', 2)
      return;
    }

    loading = true

    const array = [
      {
        Name: 'email',
        Value: Username,
      },
      {
        Name: 'nickname',
        Value: Nickname,
      }
    ];

    let list = []
    for (const field of array) {
      list.push(new CognitoUserAttribute(field))
    }

    userPool.signUp(Username, Password, list, null, function(err: any, result: any) {
      loading = false

      if (err) {
        toastMessage(err.message || JSON.stringify(err), 2)
        return;
      }

      message = true
      toastMessage('The username has been created and the confirmation link has been sent to the email address.', 1)
    });
  }

const login = async () => {
  if (botCheck) {
    return
  }

  if (!Username || !Password) {
    toastMessage('Email address and password are required information.', 2)
    return;
  }

  loading = true

  const authenticationDetails = new AuthenticationDetails({Username, Password});

  const userData = {
    Username,
    Pool: userPool,
  };

  const cognitoUser = new CognitoUser(userData);
  cognitoUser.authenticateUser(authenticationDetails, {
    onSuccess: (result) => {
      $user = {
        accessTokenExpiration: result.getAccessToken().getExpiration(),
        idTokenExpiration: result.getIdToken().getExpiration(),
        key: `CognitoIdentityServiceProvider.${PUBLIC_COGNITO_CLIENT_ID}.${result.getIdToken().payload.sub}`,
      }

      cognitoUser.getUserAttributes(function(err: any, userData: any) {
        loading = false

        if (err) {
          toastMessage(err.message || JSON.stringify(err), 2);
          return;
        }

        for (let i = 0; i < userData.length; i++) {
          $user[userData[i].getName()] = userData[i].getValue()
        }

        goto('/profile')
      });
    },

    onFailure: function(err) {
      loading = false
      toastMessage(err.message || JSON.stringify(err), 2)
    },
  });
}

const resetPassword = () => {
  if (botCheck) {
    return
  }

  if (!Username) {
    toastMessage('Email address is required.', 2)
    return
  }

  loading = true

  const userData = {
    Username,
    Pool: userPool,
  };

  const cognitoUser = new CognitoUser(userData);

  cognitoUser.forgotPassword({
    onSuccess: () => {
        toastMessage('Password reset request has been sent to email.', 1)
        state = 1
    },
    onFailure: (err) => {
      loading = false
      toastMessage(err.message || JSON.stringify(err), 2)
    }
  });
}

const newPassword = () => {
  if (botCheck) {
    return
  }

  if (!Username || !Password || !verificationCode) {
    toastMessage('Please fill in all fields.', 2)
    return
  }

  loading = true
  const userData = {
    Username,
    Pool: userPool,
  };

  const cognitoUser = new CognitoUser(userData);

  cognitoUser.confirmPassword(String(verificationCode), Password, {
		onSuccess() {
      loading = false
      toastMessage('Password changed successfully.', 1)
      state = 1
		},
		onFailure(err) {
      loading = false
      toastMessage(err.message || JSON.stringify(err), 2)
		},
	});
}
</script>

{#if browser}
  <SvelteToast />
{/if}

{#if message}
  <p>Thank you for registering an account on the website! We are thrilled to have you on board. To ensure the security of our platform and verify your identity, we kindly request you to confirm your username by clicking on the link in email we sent you.</p>
  <p>This quick verification process is essential to validate your email address and ensure that all users on our platform are genuine. By completing this step, you'll gain full access to all the exciting and upcoming features.</p>
  <p>If you encounter any issues during the verification process or have any questions regarding your account, please don't hesitate to reach out to our support team at hello@battleofgods.com. We're here to assist you every step of the way.</p>
  <p><a class="bg-primary btn text-white" href="/" rel="home">Back to home</a></p>
{:else}
  <form on:submit|preventDefault class="grid">
    <div class="input relative">
      <input id="form-username" name="username" type="email" minlength="6" maxlength="100" bind:value={Username} placeholder=" " required/>
      <label for="form-username">Email</label>
    </div>

    {#if state !== 3}
      <div class="input">
        <input id="form-password" name="password" type="password" minlength="8" maxlength="30" bind:value={Password} placeholder=" " required/>
        <label for="form-password">Password</label>
      </div>
    {/if}

    {#if state === 2}
      <div class="input">
        <input id="form-name" name="display" type="text" minlength="2" maxlength="50" bind:value={Nickname} placeholder=" " required/>
        <label for="form-name">Display name</label>
      </div>
    {:else if state === 4}
      <div class="input">
        <input id="form-verification" name="verification" type="number" bind:value={verificationCode} placeholder=" " required/>
        <label for="form-verification">Code from the email</label>
      </div>
    {/if}

    <input name="confirmEmail" type="email" bind:value={botCheck} hidden/>

    <div id="form-actions" class="flex justify-between">
      {#if state === 1}
        <button on:click={() => state = 2} class="bg-black btn p text-white">Register</button>
        <button on:click={() => login()} disabled={!Username || !Password || loading} class="bg-primary btn p text-white">Login</button>
      {:else if state === 2}
        <button on:click={() => state = 1} class="bg-black btn p text-white">Login</button>
        <button on:click={() => register()} disabled={!Username || !Nickname || !Password || loading} class="bg-primary btn p text-white">Register</button>
      {:else if state === 3}
        <button on:click={() => state = 1} class="bg-black btn p text-white">Login</button>
        <button on:click={() => resetPassword()} disabled={!Username || loading} class="bg-primary btn p text-white">Reset</button>
      {:else if state === 4}
        <button on:click={() => state = 1} class="bg-black btn p text-white">Login</button>
        <button on:click={() => newPassword()} disabled={!Username || !Password || !verificationCode || loading} class="bg-primary btn p text-white">Reset</button>
      {/if}
    </div>

    {#if state === 3}
      <p>If you have a valid username with an email address, we will send you an email after completing this form. The email will contain a code that you will need to use for completing the password change on the website's login page.</p>
    {:else if state === 1}
      <div>
        <div class="mt-3 text-center"><button on:click={() => state = 3} class="link">Did you forget your password?</button></div>
        <div class="text-center"><button on:click={() => state = 4} class="link">Password change with email code.</button></div>
      </div>
    {/if}
  </form>
{/if}