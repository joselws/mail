document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  
  // By default, load the inbox
  load_mailbox('inbox');
  
  // Send email logic
  document.querySelector('#compose-form').addEventListener('submit', () => {
      // Submit an email
      fetch('/emails', {
        method: 'POST',
        body: JSON.stringify({
          // data from form
          recipients: document.querySelector('#compose-recipients').value,
          subject: document.querySelector('#compose-subject').value,
          body: document.querySelector('#compose-body').value
        })
      })
      .then(response => response.json())
      .then(result => {
          // Print result
          alert(result.message);
      })
      .catch(error => {
        alert(error.message);
      });
    });
});


function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#read-email-view').style.display = 'none';
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
  document.querySelector('#read-email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Load mails
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      emails.forEach(email => {
        // each email is rendered inside a rectangle-like box
        const box = document.createElement('div');
        box.className = 'email';

        // Read emails have their box color gray
        if (email.read) {
          box.style.backgroundColor = 'lightgray';
        }
        else {
          box.style.backgroundColor = 'white';
        }

        // Select sender/recipient info appropriately
        let emailInfo = '';
        if (mailbox === 'inbox') {
          emailInfo = email.sender;
        }
        else {
          emailInfo = email.recipients;
        }

        // Fill the rectangle with overview email info
        box.innerHTML = `<strong>${emailInfo}:</strong> ${email.subject} <span class="date">${email.timestamp}</span>`;
        
        // Add the ability to show each email's view on click
        box.addEventListener('click', () => {
          readEmailView(email.id, mailbox);
        });

        // show each email on its respective mailbox view
        document.querySelector('#emails-view').append(box);
      });
    });
}


// Show the contents of the clicked email
function readEmailView(emailId, mailbox) {

  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#read-email-view').style.display = 'block';

  // Erase the content of any previous opened email from the view
  document.querySelector('#read-email-view').innerHTML = '';
  
  // Load the email data and display its content to the view
  fetch(`/emails/${emailId}`)
  .then(response => response.json())
  .then(email => {
    const mail = document.createElement('div');

    const sender = document.createElement('p');
    sender.innerHTML = `Sender: ${email.sender}`;
    mail.append(sender);

    const recipients = document.createElement('p');
    recipients.innerHTML = `recipients: ${email.recipients}`;
    mail.append(recipients);

    const subject = document.createElement('p');
    subject.innerHTML = `subject: ${email.subject}`;
    mail.append(subject);

    // Add an 'archive' button for emails in the inbox and archive mailbox
    if (mailbox === 'inbox' || mailbox === 'archive') {
      const archive = document.createElement('button');
      archive.className="btn btn-secondary btn-sm archive-button";

      if (mailbox === 'inbox') {
        archive.innerHTML = 'Archive';
      }
      else {
        archive.innerHTML = 'Unarchive';
      }

      archive.addEventListener('click', () => {
        archiveEmail(email.id, mailbox);
      });

      mail.append(archive);
    }


    const timestamp = document.createElement('p');
    timestamp.innerHTML = `timestamp: ${email.timestamp}`;
    mail.append(timestamp);

    const body = document.createElement('p');
    body.innerHTML = `body: ${email.body}`;
    mail.append(body);

    document.querySelector('#read-email-view').append(mail);
  })
  .catch(error => console.log(error));

  // Mark the selected email as read, if not already
  fetch(`/emails/${emailId}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  })
}


// changes archive status on selected emails
function archiveEmail(emailId, mailbox) {
  // if archived status is false, set it to true
  if (mailbox === 'inbox') {
    fetch(`/emails/${emailId}`, {
      method: 'PUT',
      body: JSON.stringify({
          archived: true
      })
    })
  }
  // set it to true otherwise
  else if (mailbox === 'archive') {
    fetch(`/emails/${emailId}`, {
      method: 'PUT',
      body: JSON.stringify({
          archived: false
      })
    })
  }

  // then load the user's inbox
  load_mailbox('inbox');
}