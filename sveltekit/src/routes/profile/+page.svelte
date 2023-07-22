<script lang="ts">
  import {goto} from '$app/navigation'
  import {hero, heroDefault, user} from '$lib/store'

  $hero = {
    ...$heroDefault,
    description: '',
    pages: [{name: 'Profile', url: '/profile'}],
    title: `Welcome, ${$user.nickname}`
  }

  const logout = () => {
    localStorage.clear()
    $hero = undefined
    goto('/')
  }
</script>

<div id="about" class="mb-3 mx-auto">
  <p>As a new member of our community, we're thrilled to have you here. You now have the ability to edit existing articles and share your thoughts by commenting on them.</p>
  <p>Please note that all submitted articles and messages undergo review before publication to maintain the platform's quality and standards.</p>
  <p>Thank you for joining us, and we're excited to see your contributions!</p>

  <div class="mt-2 text-center"><button on:click={() => logout()} class="bg-black">Logout</button></div>

  <div class="mt-2">
    <details>
      <summary>Rules</summary>
      <div>
        <p>At our platform, we cherish freedom of speech and embrace discussions about religions. We encourage diverse opinions while strictly prohibiting:</p>
        <p><strong>Personal attacks and hate speech</strong>: Please engage in respectful and constructive dialogue, refraining from any form of personal attacks on individuals or groups based on their beliefs.</p>
        <p><strong>Illegal activities</strong>: Any discussions or content promoting illegal activities will not be tolerated. Please adhere to all applicable laws and regulations.</p>
        <p><strong>Self-promotion</strong>: Avoid promoting your own religious affiliations or any other personal agenda. Our aim is to facilitate impartial and open conversations.</p>
        <p><strong>Trolling and harassment</strong>: We encourage discussions with respect and empathy, and any form of trolling or harassment will not be permitted.</p>
        <p>Let's engage in meaningful conversations and foster an inclusive community. Thank you for being part of this enriching experience.</p>
      </div>
    </details>

    <details>
      <summary>How to edit an article?</summary>
      <div>At the bottom of each article is the button <strong>Edit page</strong>, which you can press to open the editing view. Edit the text as desired and press <strong>Save</strong>.</div>
    </details>

    <details>
      <summary>How to send a comment?</summary>
      <div>The comment section can be found below each article, excluding the main page of each religion. Press the <strong>Leave a comment</strong> button, after which a text field opens. Write a comment and press <strong>Send</strong>.</div>
    </details>
  </div>
</div>

<style lang="scss" scoped>
  details {
    div {
      margin-top: 1rem;
    }

    &:first-child summary {
      border-top: 1px solid var(--border-light);
    }
  }

  summary {
    border-bottom: 1px solid var(--border-light);
    cursor: pointer;
    padding: 1rem;
  }
</style>
