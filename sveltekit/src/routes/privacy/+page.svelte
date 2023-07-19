<script lang="ts">
  import { hero, heroDefault } from '$lib/store'

  $hero = {
    ...$heroDefault,
    title: 'Data protection by design and by default',
    description: 'At Battle of Gods, we take your privacy and data protection seriously. This GDPR compliance statement outlines how we handle and protect your personal information.'
  }

  const date = '2023-07-17T17:45:42.000Z'
  const modified = '2023-07-17T18:00:00.000Z'
</script>

<svelte:head>
  <meta content={date} name="pubdate" property="og:pubdate">
  <meta content={date} property="article:published_time">
  <meta content={modified} name="revised" property="article:modified_time">
</svelte:head>

<p>At Battle of Gods, we take your privacy and data protection seriously. This GDPR compliance statement outlines
  how we handle and protect your personal information when you use our website and services. Please read this
  statement carefully to understand our data practices.</p>

<h2>Data Collection and Usage</h2>

  <p>
      <strong>Data Collection:</strong> Battle of Gods does not collect visitor data from the website using
      third-party scripts. The only data we collect is obtained when a new user registers for an account, logs in,
      or updates their user ID information.
  </p>

  <p>
      <strong>User ID Information:</strong> User ID information is stored in the AWS Cognito database, a secure
      cloud service provided by Amazon Web Services. We use this information to authenticate users and manage their
      accounts.
  </p>

  <p>
      <strong>Web Service Data:</strong> User data, including ID and name, may be stored in Cloudflare D1, a cloud
      service database provided by Cloudflare. This information is saved only if the user has updated pages or sent
      comments. The user's name is encrypted in the database to ensure an additional layer of security.
  </p>

<h2>Data Protection and Security</h2>

  <p>
      <strong>AWS Cognito Security:</strong> As Amazon is one of the largest and most trusted cloud service
      providers, we rely on their security measures to protect the data stored in AWS Cognito. For more information
      about AWS Cognito's data protection practices, you can refer to the <a
          href="https://docs.aws.amazon.com/cognito/latest/developerguide/data-protection.html" target="_blank">Data
          Protection in Amazon Cognito</a> documentation.
  </p>

  <p>
      <strong>Cloudflare D1 Security:</strong> Cloudflare D1 also maintains robust security measures to safeguard
      user data. We ensure that data encryption and other necessary security protocols are implemented to protect
      the stored information.
  </p>

<h2>Data Retention and Removal</h2>

  <p>
      <strong>Data Maintenance:</strong> The maintenance of databases and user data is handled by <a
          href="https://timoanttila.com/" target="_blank">Timo Anttila</a>. If you have any concerns or wish to
      remove your user data from our services, please contact him.
</p>

<h2>Consent and User Rights</h2>

 <p>
      <strong>Consent:</strong> By using Battle of Gods website and services, you consent to the collection, storage,
      and processing of your personal information as described in this GDPR compliance statement.
  </p>

  <p>
      <strong>User Rights:</strong> As a user, you have the right to access, modify, or request the deletion of your
      personal data. If you wish to exercise any of these rights, please contact Timo Anttila at the provided email
      address.
  </p>

<h2>Changes to this GDPR Compliance Statement</h2>

<p>Battle of Gods may update this GDPR compliance statement from time to time to reflect changes in our data practices
  or legal requirements. We encourage you to review this statement regularly for any updates.</p>

<p>If you have any questions or concerns about our GDPR compliance or data handling practices, please don't hesitate
  to contact us at hello@battleofgods.net.</p>