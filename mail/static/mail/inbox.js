document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  
  // By default, load the inbox
  load_mailbox('inbox');
  
  // Send email logic
  document.querySelector('#compose-form').addEventListener('submit', async () => {
      // Submit an email
      await fetch('/emails', {
        method: 'POST',
        body: JSON.stringify({
          recipients: document.querySelector('#compose-recipients').value,
          subject: document.querySelector('#compose-subject').value,
          body: document.querySelector('#compose-body').value
        })
      })
      .then(response => response.json())
      .then(result => {
          // Print result
          console.log(result.message);
          load_mailbox('sent');
      }).catch(error => {
        console.log(error.message);
      });
  
  });
});


function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Input fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Load mails
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      emails.forEach(email => {
        const box = document.createElement('div');
        box.setAttribute('class', 'email');
        if (email.read) {
          box.style.backgroundColor = 'lightgray';
        }
        else {
          box.style.backgroundColor = 'white';
        }

        let emailInfo = '';
        if (mailbox === 'inbox') {
          emailInfo = email.sender;
        }
        else {
          emailInfo = email.recipients;
        }

        box.innerHTML = `<strong>${emailInfo}:</strong> ${email.subject} <span class="date">${email.timestamp}</span>`;

        // show each email on its respective mailbox view
        document.querySelector('#emails-view').append(box);
      });
    });
}