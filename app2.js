const express = require('express');
const crypto = require('crypto');
const helmet = require('helmet');
const cors = require('cors');
const GhostAdminAPI = require('@tryghost/admin-api');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

const api = new GhostAdminAPI({
  url: process.env.GHOST_URL,
  key: process.env.GHOST_ADMIN_API_KEY,
  version: 'v4'
});

const webhookSecret = process.env.WEBHOOK_SECRET;

/*const api = new GhostAdminAPI({
  url: 'http://your-ghost-url', // replace with your Ghost site's URL
  key: 'your-admin-api-key', // replace with your Admin API key
  version: 'v4'
});

const webhookSecret = 'your-webhook-secret'; // Replace with your real secret**/

app.post('/webhook', (req, res) => {
  const signature = req.get('x-ghost-signature');
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (signature !== expectedSignature) {
    res.status(401).send('Invalid signature');
    return;
  }

  if (req.body.event !== 'member.added') {
    res.status(400).send('Invalid event');
    return;
  }

  const memberId = req.body.member.id;

  api.members.read({ id: memberId })
    .then(member => {
      console.log('Member details:', member);
      res.status(200).send(member);
    })
    .catch(err => {
      console.error('Error fetching member details:', err);
      res.status(500).send('Error fetching member details');
    });
});

//
const { exec } = require('child_process');

app.post('/webhook', (req, res) => {
    // Extract event data from the request body
    const eventData = req.body;

    // Check if the event is 'member.added' and the member is a paying member
    if (eventData.event === 'member.added' && eventData.member.paid) {
        // Determine the tier of membership
        const tier = eventData.member.tier;

        // Run the shell script corresponding to the paid tier
        exec(`./${tier}_script.sh`, (err, stdout, stderr) => {
            if (err) {
                console.error(`exec error: ${err}`);
                return;
            }

            console.log(`stdout: ${stdout}`);
            console.error(`stderr: ${stderr}`);
        });
    }

    // Send a response to acknowledge receipt of the event
    res.status(200).end();
});

//

const port = 3000;
app.listen(port, function() {
  console.log(`App is listening on port ${port}!`);
});
